# EfficientNet-B0 Deepfake Detection Model Weights

Place your fine-tuned PyTorch checkpoint here to enable active EfficientNet inference.

### Expected Filename:
- `weights/efficientnet_b0_deepfake.pth`
  (or set the `EFFICIENTNET_WEIGHTS_PATH` environment variable)

### Architecture:
- Backbone: `torchvision.models.efficientnet_b0`
- Classifier Head: Binary classification head `Linear(in_features=1280, out_features=1)` with sigmoid activation, or 2-class softmax.

### Status When Missing:
If no `.pth` file is provided in this directory, the FastAPI microservice gracefully reports:
- `status: "NOT_CONFIGURED"`
- `configured: false`
- `fake_probability: null`

In this mode, no fake or placeholder scores are returned, and the system relies on Gemini Flash Multimodal Neural Vision while notifying the user that EfficientNet checkpoint weights need to be supplied.
