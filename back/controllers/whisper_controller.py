import requests
from flask import jsonify, request

class WhisperController:
    @staticmethod
    def transcribe_audio():
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        audio_file = request.files['file']

        try:
            whisper_url = "http://whisper:5003/transcribe"
            response = requests.post(
                whisper_url,
                files={'file': (audio_file.filename, audio_file.stream, audio_file.mimetype)}
            )
            response.raise_for_status()
            
            data = response.json()
            transcript = data.get("transcript", "")
            return jsonify({"transcript": transcript}), 200

        except requests.RequestException as e:
            return jsonify({"error": f"Whisper service error: {str(e)}"}), 500

    @staticmethod
    def check_health():
        try:
            whisper_url = "http://whisper:5003/health"
            response = requests.get(whisper_url)
            response.raise_for_status()

            data = response.json()
            status = data.get("status", "unknown")
            if status == "ready":
                return jsonify({"status": "ready"}), 200
            else:
                return jsonify({"status": "loading"}), 503

        except requests.RequestException as e:
            return jsonify({"error": f"Whisper service health check error: {str(e)}"}), 500
