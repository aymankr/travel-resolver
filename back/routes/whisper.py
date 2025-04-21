from flask import Blueprint
from controllers.whisper_controller import WhisperController

whisper_bp = Blueprint('whisper', __name__)

@whisper_bp.route('/whisper/transcribe', methods=['POST'])
def transcribe_audio():
    return WhisperController.transcribe_audio()

@whisper_bp.route('/whisper/health', methods=['GET'])
def check_health():
    return WhisperController.check_health()
