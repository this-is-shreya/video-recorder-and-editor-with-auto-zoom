# vosk_service.py
from vosk import Model, KaldiRecognizer
import wave
import json
import sys
import os

model = Model("../server/vosk_model/model")
print("model", model)
def transcribe_audio(file_path):
    wf = wave.open(file_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            results.append(json.loads(rec.Result()))

    final = json.loads(rec.FinalResult())
    results.append(final)

    words = []
    for r in results:
        if 'result' in r:
            words.extend(r['result'])

    return words

if __name__ == "__main__":
    input_path = sys.argv[1]
    print("input",input_path)
    if not os.path.exists(input_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    try:
        transcript = transcribe_audio(input_path)
        print(json.dumps(transcript))  # Output result as JSON string
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
