import React, { useState } from 'react';
import { AppStep, PhotoData } from './types';
import CameraCapture from './components/CameraCapture';
import PhotoEditor from './components/PhotoEditor';
import { Camera, Heart, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.START);
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  const handleStart = () => {
    setStep(AppStep.CAPTURE);
  };

  const handleCaptureComplete = (capturedPhotos: PhotoData[]) => {
    setPhotos(capturedPhotos);
    setStep(AppStep.EDIT);
  };

  const handleRetake = () => {
    setPhotos([]);
    setStep(AppStep.CAPTURE);
  };

  return (
    <div className="w-full h-[100dvh] bg-[#fff0f5] text-gray-800 overflow-hidden relative">
      {/* Background decoration */}
      {step !== AppStep.EDIT && (
        <>
          <div className="absolute top-10 left-10 text-pink-200 opacity-50 animate-bounce delay-100">
            <Heart size={40} fill="currentColor" />
          </div>
          <div className="absolute bottom-20 right-10 text-purple-200 opacity-50 animate-bounce delay-700">
            <Heart size={60} fill="currentColor" />
          </div>
          <div className="absolute top-1/3 right-8 text-yellow-200 opacity-60 animate-pulse">
            <Sparkles size={50} />
          </div>
        </>
      )}

      {step === AppStep.START && (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="mb-10 relative group">
                <div className="w-52 h-72 bg-pink-200 rounded-2xl shadow-[0_0_0_10px_rgba(255,255,255,0.5)] rotate-[-6deg] absolute top-0 left-0 -translate-x-4 translate-y-2"></div>
                <div className="w-52 h-72 bg-white border-8 border-white p-3 rounded-2xl shadow-xl relative z-10 flex flex-col gap-3 rotate-[6deg] transition-transform hover:rotate-[3deg]">
                    <div className="flex-1 bg-pink-50 rounded-lg flex items-center justify-center"><Heart className="text-pink-200" size={24} /></div>
                    <div className="flex-1 bg-pink-50 rounded-lg flex items-center justify-center"><Heart className="text-pink-200" size={24} /></div>
                    <div className="flex-1 bg-pink-50 rounded-lg flex items-center justify-center"><Heart className="text-pink-200" size={24} /></div>
                    <div className="flex-1 bg-pink-50 rounded-lg flex items-center justify-center"><Heart className="text-pink-200" size={24} /></div>
                </div>
            </div>
            
            <h1 className="text-6xl font-bold tracking-wider mb-2 text-pink-500 drop-shadow-sm">Life4Cuts</h1>
            <p className="text-gray-500 mb-12 text-2xl font-bold">Capture cute moments :)</p>
            
            <button 
                onClick={handleStart}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-white transition-all duration-200 bg-pink-400 rounded-full shadow-[4px_4px_0px_0px_rgba(255,182,193,1)] hover:translate-y-1 hover:shadow-none active:scale-95"
            >
                <Camera className="mr-3 group-hover:rotate-12 transition-transform" size={28} />
                Start Now
            </button>

            <p className="mt-8 text-sm text-pink-300 font-bold tracking-widest uppercase">
                Free • Cute • Fun
            </p>
        </div>
      )}

      {step === AppStep.CAPTURE && (
        <CameraCapture 
            onComplete={handleCaptureComplete} 
            onCancel={() => setStep(AppStep.START)} 
        />
      )}

      {step === AppStep.EDIT && (
        <PhotoEditor 
            photos={photos} 
            onRetake={handleRetake} 
        />
      )}
    </div>
  );
};

export default App;