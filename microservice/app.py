import os
import io
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np

app = FastAPI(
    title="DeepShield EfficientNet-B0 & Face Detection Microservice",
    version="1.0.0",
    description="Dedicated PyTorch EfficientNet-B0 FF++ c23 inference & OpenCV face detection service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_WEIGHTS_DIR = os.path.join(PROJECT_ROOT, "weights")

CANDIDATE_WEIGHT_NAMES = [
    "efficientnet_b0_ffpp_c23.pth",
    "efficientnet_b0_deepfake.pth",
    "efficientnet_b0_deepfake.pt",
    "efficientnet_b0.pth",
    "model.pth",
]

def find_weights_path() -> Optional[str]:
    env_path = os.environ.get("EFFICIENTNET_WEIGHTS_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path
    
    if os.path.isdir(DEFAULT_WEIGHTS_DIR):
        for name in CANDIDATE_WEIGHT_NAMES:
            candidate = os.path.join(DEFAULT_WEIGHTS_DIR, name)
            if os.path.isfile(candidate):
                return candidate
    return None

class HealthResponse(BaseModel):
    status: str
    model: str
    architecture: str
    weights_configured: bool
    weights_path: Optional[str]
    device: str
    service_uptime_seconds: float
    message: str

START_TIME = time.time()
LOADED_MODEL = None
FACE_CASCADE = None

def get_face_cascade():
    global FACE_CASCADE
    if FACE_CASCADE is None:
        try:
            import cv2
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            FACE_CASCADE = cv2.CascadeClassifier(cascade_path)
        except Exception as e:
            print(f"Failed to load OpenCV face cascade: {e}")
            FACE_CASCADE = None
    return FACE_CASCADE

def get_model():
    global LOADED_MODEL
    weights_path = find_weights_path()
    if not weights_path:
        return None, None
    
    if LOADED_MODEL is not None:
        return LOADED_MODEL, weights_path

    try:
        import torch
        import torchvision.models as models

        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        # 2-class classifier head (0 = REAL, 1 = FAKE)
        model.classifier[1] = torch.nn.Linear(in_features, 2)

        checkpoint = torch.load(weights_path, map_location="cpu")
        if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            model.load_state_dict(checkpoint["state_dict"], strict=False)
        elif isinstance(checkpoint, dict):
            # Try strict first, fall back to strict=False if needed
            try:
                model.load_state_dict(checkpoint, strict=True)
            except Exception:
                model.load_state_dict(checkpoint, strict=False)
        else:
            model = checkpoint

        model.eval()
        LOADED_MODEL = model
        print(f"Loaded EfficientNet-B0 model successfully from {weights_path}")
        return LOADED_MODEL, weights_path
    except Exception as e:
        print(f"Error loading model from {weights_path}: {e}")
        return None, weights_path

@app.on_event("startup")
def startup_event():
    get_face_cascade()
    get_model()

@app.get("/health", response_model=HealthResponse)
def health():
    weights_path = find_weights_path()
    configured = weights_path is not None
    
    device = "cpu"
    try:
        import torch
        if torch.cuda.is_available():
            device = "cuda"
    except Exception:
        pass

    message = (
        f"EfficientNet-B0 weights configured from {weights_path}"
        if configured
        else "EfficientNet-B0 weights not found. Service running in unconfigured mode (no fake predictions will be generated)."
    )

    return HealthResponse(
        status="ok",
        model="EfficientNet-B0 (PyTorch FF++ c23)",
        architecture="torchvision.models.efficientnet_b0 (Linear 1280 -> 2)",
        weights_configured=configured,
        weights_path=weights_path,
        device=device,
        service_uptime_seconds=round(time.time() - START_TIME, 2),
        message=message
    )

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Validate mime
    content_type = file.content_type or ""
    if not (content_type.startswith("image/") or content_type == "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Invalid media type. An image is required.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    weights_path = find_weights_path()

    # Load image for processing
    try:
        pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        w_img, h_img = pil_img.size
        np_img = np.array(pil_img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode image: {str(e)}")

    # 1. Run OpenCV real face detection
    faces_list = []
    try:
        import cv2
        cascade = get_face_cascade()
        if cascade is not None:
            gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
            detected_rects = cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(30, 30)
            )
            for idx, (x, y, w, h) in enumerate(detected_rects):
                ymin = max(0, min(1000, int((y / h_img) * 1000)))
                xmin = max(0, min(1000, int((x / w_img) * 1000)))
                ymax = max(0, min(1000, int(((y + h) / h_img) * 1000)))
                xmax = max(0, min(1000, int(((x + w) / w_img) * 1000)))
                faces_list.append({
                    "id": idx + 1,
                    "box": {
                        "ymin": ymin,
                        "xmin": xmin,
                        "ymax": ymax,
                        "xmax": xmax
                    },
                    "pixelBox": {
                        "x": int(x),
                        "y": int(y),
                        "w": int(w),
                        "h": int(h)
                    }
                })
    except Exception as e:
        print(f"Face detection error: {e}")

    # 2. Check if weights are configured
    if not weights_path:
        exec_time_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "NOT_CONFIGURED",
            "configured": False,
            "model": "EfficientNet-B0 (PyTorch)",
            "weights_configured": False,
            "weights_path": None,
            "prediction": "UNCERTAIN",
            "confidence": 0,
            "real_probability": None,
            "fake_probability": None,
            "faces": faces_list,
            "faces_detected": len(faces_list),
            "message": "EfficientNet-B0 deepfake detection weights (.pth) not found in weights/ directory. The model is unconfigured and cannot provide deepfake predictions.",
            "execution_time_ms": exec_time_ms,
            "error_code": "WEIGHTS_UNCONFIGURED"
        }

    # 3. Perform real PyTorch inference
    try:
        import torch
        import torchvision.transforms as transforms

        model, loaded_path = get_model()
        if model is None:
            raise RuntimeError(f"Could not initialize model from {weights_path}")

        # Preprocessing consistent with checkpoint documented inference pipeline (224x224 RGB, ToTensor)
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])
        input_tensor = preprocess(pil_img).unsqueeze(0)

        with torch.no_grad():
            output = model(input_tensor)
            probs = torch.softmax(output, dim=1)[0]
            # Class 0 = REAL, Class 1 = FAKE
            real_prob = float(probs[0].item())
            fake_prob = float(probs[1].item())

        exec_time_ms = round((time.time() - start_time) * 1000, 2)
        is_fake = fake_prob >= 0.5
        confidence = round(max(real_prob, fake_prob) * 100, 1)

        return {
            "status": "SUCCESS",
            "configured": True,
            "model": "EfficientNet-B0 (PyTorch FF++ c23)",
            "weights_configured": True,
            "weights_path": weights_path,
            "prediction": "DEEPFAKE" if is_fake else "REAL",
            "confidence": confidence,
            "real_probability": round(real_prob, 4),
            "fake_probability": round(fake_prob, 4),
            "faces": faces_list,
            "faces_detected": len(faces_list),
            "message": f"Inference completed. Class 0 (REAL): {real_prob:.4f}, Class 1 (FAKE): {fake_prob:.4f}",
            "execution_time_ms": exec_time_ms
        }
    except Exception as e:
        exec_time_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "ERROR",
            "configured": True,
            "model": "EfficientNet-B0 (PyTorch)",
            "weights_configured": True,
            "weights_path": weights_path,
            "prediction": "UNCERTAIN",
            "confidence": 0,
            "real_probability": None,
            "fake_probability": None,
            "faces": faces_list,
            "faces_detected": len(faces_list),
            "message": f"Error during EfficientNet inference: {str(e)}",
            "execution_time_ms": exec_time_ms,
            "error_code": "INFERENCE_FAILED"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5050)
