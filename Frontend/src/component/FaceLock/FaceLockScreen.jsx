import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, ScanFace } from 'lucide-react';
import { BaseUrl } from '../../utils/constance';

const MODEL_URL = '/models';

export default function FaceLockScreen({ onUnlock }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [faceapi, setFaceapi] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    import('face-api.js').then(async (fa) => {
      await Promise.all([
        fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      if (mounted) setFaceapi(fa);
    }).catch(() => {});

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      }).catch(() => {});

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const verify = async () => {
    if (!faceapi || !videoRef.current || scanning) return;
    setScanning(true);
    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast.error('No face detected. Please look at the camera.');
        setScanning(false);
        return;
      }

      const descriptor = Array.from(detections.descriptor);
      const res = await axios.post(`${BaseUrl}/profile/face-lock/verify`, { descriptor }, { withCredentials: true });
      if (res.data.verified) {
        streamRef.current?.getTracks().forEach(t => t.stop());
        onUnlock?.();
      } else {
        toast.error('Face not recognized. Try again.');
      }
    } catch {
      toast.error('Verification failed. Try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}>
      <div className="text-center w-full max-w-sm mx-4 p-8 rounded-3xl border border-purple-500/30"
        style={{ background: 'linear-gradient(160deg, #1a0928, #12061e)' }}>

        <ScanFace size={48} className="mx-auto mb-4" style={{ color: '#c4789a' }} />
        <h2 className="text-2xl font-black text-white mb-2">Face Lock</h2>
        <p className="text-purple-300 text-sm mb-6">Look at the camera to unlock LoveNest.</p>

        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-black">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-40 h-40 rounded-full border-2 border-dashed transition-colors ${scanning ? 'border-green-400/70 animate-pulse' : 'border-pink-400/50'}`} />
          </div>
        </div>

        <button onClick={verify} disabled={!faceapi || scanning}
          className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
          {scanning ? <span className="loading loading-spinner loading-sm" /> : <><Camera size={18} /> Scan Face</>}
        </button>
      </div>
    </div>
  );
}
