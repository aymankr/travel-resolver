from flask import Flask, request, jsonify
import os
import whisper
import tempfile
import traceback
import subprocess
import json
import torch

app = Flask(__name__)

class WhisperService:
    def __init__(self):
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        model_name = os.getenv("MODEL_NAME", "medium")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        try:
            self.model = whisper.load_model(model_name, device=device)
            print(f"Whisper model '{model_name}' loaded successfully on {device}.")
        except Exception as e:
            print(f"Error loading Whisper model '{model_name}': {str(e)}")
            raise e

    def transcribe_audio(self, audio_file):
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_in:
            audio_file.save(tmp_in.name)
            tmp_in_path = tmp_in.name

        file_size = os.path.getsize(tmp_in_path)
        if file_size == 0:
            os.remove(tmp_in_path)
            print("Received empty audio file.")
            return {"error": "Empty audio file, please try again."}, 400

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_out:
            tmp_out_path = tmp_out.name

        try:
            convert_to_wav(tmp_in_path, tmp_out_path)

            result = self.model.transcribe(tmp_out_path, language="fr")
            transcript = result.get("text", "").strip()
        except Exception as e:
            print(f"Error during transcription: {str(e)}")
            traceback.print_exc()
            return {"error": f"Transcription error: {str(e)}"}, 500
        finally:
            if os.path.exists(tmp_in_path):
                os.remove(tmp_in_path)
            if os.path.exists(tmp_out_path):
                os.remove(tmp_out_path)

        return {"transcript": transcript}, 200

whisper_service = WhisperService()

def convert_to_wav(input_path, output_path):
    cmd = [
        "ffmpeg", 
        "-y",
        "-i", input_path,
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        output_path
    ]
    try:
        subprocess.run(cmd, check=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        raise RuntimeError(f"Failed to convert audio: {e.stderr.decode()}")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['file']
    result, status_code = whisper_service.transcribe_audio(audio_file)

    response = app.response_class(
        response=json.dumps(result, ensure_ascii=False),
        status=status_code,
        mimetype='application/json'
    )
    return response

@app.route('/health', methods=['GET'])
def health():
    if whisper_service.model:
        return jsonify({"status": "ready"}), 200
    else:
        return jsonify({"status": "loading"}), 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)
