import io
import time
from pathlib import Path

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "efficientnet_b0_ffpp_c23.pth"

app = FastAPI(title="DeepShield EfficientNet Service")

device = torch.device("cpu")

# Load trained EfficientNet-B0
checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(1280, 2)
model.load_state_dict(checkpoint, strict=True)
model.to(device)
model.eval()

# Preprocessing confirmed from the model card.
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "EfficientNet-B0",
        "device": str(device)
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Missing image filename"
    )

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        tensor = preprocess(image).unsqueeze(0).to(device)

        start = time.perf_counter()

        with torch.inference_mode():
            logits = model(tensor)
            probabilities = torch.softmax(logits, dim=1)[0]

        elapsed_ms = (time.perf_counter() - start) * 1000

        real_probability = probabilities[0].item()
        fake_probability = probabilities[1].item()

        prediction = (
            "FAKE"
            if fake_probability > real_probability
            else "REAL"
        )

        return {
            "model": "EfficientNet-B0",
            "prediction": prediction,
            "real_probability": real_probability,
            "fake_probability": fake_probability,
            "inference_time_ms": round(elapsed_ms, 2)
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )