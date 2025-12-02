import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhotoData } from '../types';
import { Camera, RefreshCw, X, Heart } from 'lucide-react';

interface CameraCaptureProps {
  onComplete: (photos: PhotoData[]) => void;
  onCancel: () => void;
}

const COUNTDOWN_SECONDS = 3;
const TOTAL_SHOTS = 4;

const CameraCapture: React.FC<CameraCaptureProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 3/4 } // Portrait aspect
        },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    // Handle resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror the image if in user facing mode so it looks natural like a mirror
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPhotos(prev => [...prev, { id: Date.now().toString(), dataUrl }]);
      
      // Flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }
  }, [facingMode]);

  // Main capture loop logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isCountingDown) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        // Countdown finished, take photo
        capturePhoto();
        
        if (photos.length + 1 < TOTAL_SHOTS) {
            // Prepare for next shot immediately
            setCountdown(COUNTDOWN_SECONDS);
        } else {
            // Done
            setIsCountingDown(false);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isCountingDown, countdown, photos.length, capturePhoto]);


  // Trigger when photos updated, if we reached total, finish
  useEffect(() => {
    if (photos.length === TOTAL_SHOTS) {
       // Small delay to let the user see the last flash
       setTimeout(() => onComplete(photos), 500);
    }
  }, [photos, onComplete]);

  const startSequence = () => {
    setPhotos([]);
    setCountdown(COUNTDOWN_SECONDS);
    setIsCountingDown(true);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top Bar / Progress */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-center gap-3 bg-gradient-to-b from-black/40 to-transparent pt-8">
          {[...Array(TOTAL_SHOTS)].map((_, i) => (
            <div 
              key={i} 
              className={`transition-all duration-300 ${
                i < photos.length ? 'text-pink-500 scale-110 drop-shadow-md' : 'text-white/50'
              }`}
            >
              <Heart fill="currentColor" size={i < photos.length ? 28 : 20} />
            </div>
          ))}
      </div>

      {/* Video Area - Centered and Maximized */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="relative w-full max-w-lg aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl border-2 border-white/20">
            <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Flash Overlay */}
            {flash && <div className="absolute inset-0 bg-white z-50 pointer-events-none opacity-80 transition-opacity duration-150" />}

            {/* Countdown Overlay - Static */}
            {isCountingDown && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-40">
                <span className="text-[8rem] md:text-[10rem] font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                {countdown}
                </span>
            </div>
            )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-32 bg-black/80 backdrop-blur-md flex items-center justify-around px-8 pb-4">
        {!isCountingDown ? (
            <>
                <button 
                    onClick={onCancel}
                    className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
                >
                    <X size={28} />
                </button>
                
                <button 
                    onClick={startSequence}
                    className="p-1 rounded-full border-4 border-white/30 hover:border-white transition-colors active:scale-95"
                >
                    <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                        <Camera size={32} className="text-white" />
                    </div>
                </button>

                <button 
                    onClick={toggleCamera}
                    className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
                >
                    <RefreshCw size={28} />
                </button>
            </>
        ) : (
             <p className="text-white font-handwritten text-2xl animate-pulse">Capturing...</p>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;