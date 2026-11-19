
import time
from pathlib import Path

import torch
from torch import nn
from torchvision import models, transforms
from PIL import Image
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

MODEL_PATH = BASE_DIR / "models" / "efficientnet_b0_ffpp_c23.pth"
DATASET_DIR = PROJECT_DIR / "evaluation_dataset"

device = torch.device("cpu")

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

pipelines = {
    "A - Current preprocessing": transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ]),

    "B - ImageNet normalization": transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
}

for pipeline_name, preprocess in pipelines.items():

    actual_labels = []
    predicted_labels = []

    start = time.perf_counter()

    for folder, actual_label in [("real", 0), ("fake", 1)]:
        folder_path = DATASET_DIR / folder

        for image_path in folder_path.iterdir():
            if image_path.suffix.lower() not in [
                ".jpg", ".jpeg", ".png", ".bmp", ".webp"
            ]:
                continue

            try:
                image = Image.open(image_path).convert("RGB")
                tensor = preprocess(image).unsqueeze(0).to(device)

                with torch.inference_mode():
                    logits = model(tensor)
                    prediction = logits.argmax(dim=1).item()

                actual_labels.append(actual_label)
                predicted_labels.append(prediction)

            except Exception as error:
                print(f"Skipped {image_path.name}: {error}")

    elapsed = time.perf_counter() - start

    print("\n===================================")
    print(pipeline_name)
    print("===================================")
    print(f"Images tested: {len(actual_labels)}")
    print(f"Accuracy : {accuracy_score(actual_labels, predicted_labels) * 100:.2f}%")
    print(f"Precision: {precision_score(actual_labels, predicted_labels, zero_division=0) * 100:.2f}%")
    print(f"Recall   : {recall_score(actual_labels, predicted_labels, zero_division=0) * 100:.2f}%")
    print(f"F1-score : {f1_score(actual_labels, predicted_labels, zero_division=0) * 100:.2f}%")
    print(f"Time     : {elapsed:.2f} seconds")
