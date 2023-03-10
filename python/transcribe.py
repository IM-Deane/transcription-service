import sys
import os
import whisper


def transcribe_file(file):
    """
    Accepts an audio file and transcribes it using Whisper.
    """
    file_extension = os.path.splitext(file)[1]
    if file_extension in ["mp3", ".wav", ".flac", ".ogg", ".m4a", ".wma"]:
        model = whisper.load_model("tiny")

        result = model.transcribe(file, language="english")
        print(result["text"].strip())


transcribe_file(sys.argv[1])