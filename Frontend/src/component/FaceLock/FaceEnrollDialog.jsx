import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, X, CheckCircle } from 'lucide-react';
import { BaseUrl } from '../../utils/constance';

const MODEL_URL = '/models';

export default function FaceEnrollDialog({ onClose, onEnrolled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
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
    }).catch(() => toast.error('Failed to load face models'));

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (mounted) setReady(true);
      })
      .catch(() => toast.error('Camera access denied'));

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const enroll = async () => {
    if (!faceapi || !videoRef.current) return;
    setLoading(true);
    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast.error('No face detected. Please look at the camera.');
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detections.descriptor);
      await axios.post(`${BaseUrl}/profile/face-lock/enroll`, { descriptor }, { withCredentials: true });
      toast.success('Face enrolled successfully!');
      onEnrolled?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm mx-4 p-6 rounded-3xl border border-purple-500/30"
        style={{ background: 'linear-gradient(160deg, #1a0928, #12061e)' }}>

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">Enroll Face ID</h3>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-purple-300 text-sm mb-5">
          Look directly at the camera and click "Capture" to enroll your face.
        </p>

        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-5 bg-black">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="loading loading-spinner text-purple-400" />
            </div>
          )}
          {/* Face guide circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-pink-400/50" />
          </div>
        </div>

        <button onClick={enroll} disabled={!ready || loading || !faceapi}
          className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
          {loading ? <span className="loading loading-spinner loading-sm" /> : <><Camera size={18} /> Capture &amp; Enroll</>}
        </button>
      </div>
    </div>
  );
}
