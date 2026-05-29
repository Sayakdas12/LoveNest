# face-api.js Model Weights

Download the following model weight files from:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Required files (place ALL files for each model here):

1. **tiny_face_detector_model** (for face detection)
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`

2. **face_landmark_68_model** (for 68 facial landmarks)
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`

3. **face_recognition_model** (for face descriptors / matching)
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

Quick download via PowerShell (run from this directory):

```powershell
$base = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
$files = @(
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2"
)
foreach ($f in $files) { Invoke-WebRequest "$base/$f" -OutFile $f }
```
