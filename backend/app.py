from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Form
import whisperx
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models = {}


@app.get("/")
def root():
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), model: str = Form(...)):

    if model not in models:
        print(f"Cargando modelo: {model}")

        models[model] = whisperx.load_model(
            model,
            device="cpu",
            compute_type="int8",
            language="es"
        )

    model = models[model]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp:
        content = await file.read()
        temp.write(content)
        temp_path = temp.name

    try:
        audio = whisperx.load_audio(temp_path)

        result = model.transcribe(audio)

        text = " ".join(
            segment["text"]
            for segment in result["segments"]
        )

        return {
            "text": text
        }

    finally:
        os.remove(temp_path)