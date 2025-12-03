
import React, { useEffect, useRef, useState } from 'react';
import { PhotoData, FRAME_COLORS, FrameConfig } from '../types';
import { generateCaption } from '../services/geminiService';
import { Download, Sparkles, ChevronLeft, Type, Wand2, LayoutGrid, Grid3x3, Square, Columns } from 'lucide-react';

interface PhotoEditorProps {
  photos: PhotoData[];
  onRetake: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ photos, onRetake }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameConfig, setFrameConfig] = useState<FrameConfig>({
    color: FRAME_COLORS[2].hex, // Default to pink
    textColor: FRAME_COLORS[2].text,
    layout: 'strip'
  });
  const [caption, setCaption] = useState("Life4Cuts");
  const [vibeInput, setVibeInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [date] = useState(new Date().toLocaleDateString());
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [filter, setFilter] = useState<'original' | 'instax' | 'vintage'>('original');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState<'layout' | 'color' | 'filter' | 'caption' | 'magic'>('layout');

  // Detect if device is iPhone, iPad, or Android
  const isMobileDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  };

  // Helper function to apply filters manually (for mobile compatibility)
  const applyFilterToImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number,
    filterType: 'original' | 'instax' | 'vintage'
  ) => {
    if (filterType === 'original') {
      // No filter, draw directly
      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      return;
    }

    // Create temporary canvas for filter application
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = dWidth;
    tempCanvas.height = dHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      // Fallback: draw without filter
      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      return;
    }

    // Draw source image to temp canvas
    tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

    // Get image data
    const imageData = tempCtx.getImageData(0, 0, dWidth, dHeight);
    const data = imageData.data;

    // Apply filter manually
    if (filterType === 'instax') {
      // Instax: contrast(1.15) brightness(1.1) saturate(1.2) sepia(0.1)
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Sepia (10%)
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r * 0.9 + tr * 0.1;
        g = g * 0.9 + tg * 0.1;
        b = b * 0.9 + tb * 0.1;

        // Brightness (1.1)
        r = Math.min(255, r * 1.1);
        g = Math.min(255, g * 1.1);
        b = Math.min(255, b * 1.1);

        // Contrast (1.15)
        r = Math.min(255, Math.max(0, (r - 128) * 1.15 + 128));
        g = Math.min(255, Math.max(0, (g - 128) * 1.15 + 128));
        b = Math.min(255, Math.max(0, (b - 128) * 1.15 + 128));

        // Saturation (1.2) - simplified
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, gray + (r - gray) * 1.2));
        g = Math.min(255, Math.max(0, gray + (g - gray) * 1.2));
        b = Math.min(255, Math.max(0, gray + (b - gray) * 1.2));

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    } else if (filterType === 'vintage') {
      // Vintage: sepia(0.4) contrast(0.85) brightness(1.1) saturate(0.8)
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Sepia (40%)
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r * 0.6 + tr * 0.4;
        g = g * 0.6 + tg * 0.4;
        b = b * 0.6 + tb * 0.4;

        // Brightness (1.1)
        r = Math.min(255, r * 1.1);
        g = Math.min(255, g * 1.1);
        b = Math.min(255, b * 1.1);

        // Contrast (0.85)
        r = Math.min(255, Math.max(0, (r - 128) * 0.85 + 128));
        g = Math.min(255, Math.max(0, (g - 128) * 0.85 + 128));
        b = Math.min(255, Math.max(0, (b - 128) * 0.85 + 128));

        // Saturation (0.8)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, gray + (r - gray) * 0.8));
        g = Math.min(255, Math.max(0, gray + (g - gray) * 0.8));
        b = Math.min(255, Math.max(0, gray + (b - gray) * 0.8));

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }

    // Put modified image data back
    tempCtx.putImageData(imageData, 0, 0);

    // Draw filtered canvas to main canvas
    ctx.drawImage(tempCanvas, dx, dy);
  };

  // Preload images once to prevent flickering during editing
  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
        const promises = photos.map(p => new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = p.dataUrl;
        }));
        
        try {
            const imgs = await Promise.all(promises);
            if (isMounted) {
                setLoadedImages(imgs);
            }
        } catch (e) {
            console.error("Failed to load images", e);
        }
    };
    loadImages();
    return () => { isMounted = false; };
  }, [photos]);

  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw functionality
  useEffect(() => {
    const drawCanvas = async () => {
      const canvas = canvasRef.current;
      // Don't draw if images aren't ready yet
      if (!canvas || loadedImages.length === 0) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Configuration - Fixed high resolution for export quality
      const layout = frameConfig.layout;
      // Detect mobile device (iPhone, iPad, Android) to determine filter method
      const isMobile = isMobileDevice();
      const margin = 40;
      const spacing = 30;
      const photoWidth = 600;
      const photoHeight = Math.round(photoWidth * (4/3)); // 3:4 aspect ratio standard
      const bottomAreaHeight = 250;
      
      let cols = 1;
      let rows = 4;
      let totalIterations = 4;

      if (layout === 'grid') {
        cols = 2; rows = 2; totalIterations = 4;
      } else if (layout === 'grid3x3') {
        cols = 3; rows = 3; totalIterations = 9;
      } else if (layout === 'polaroid') {
        cols = 1; rows = 1; totalIterations = 1;
      }

      // Calculate total size
      const totalWidth = margin * 2 + (photoWidth * cols) + (spacing * (cols - 1));
      const contentHeight = (photoHeight * rows) + (spacing * (rows - 1));
      const totalHeight = margin * 2 + contentHeight + bottomAreaHeight;

      // Set canvas size
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // 1. Fill Background (Solid or Gradient)
      if (frameConfig.gradient) {
        const gradient = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
        gradient.addColorStop(0, frameConfig.gradient[0]);
        gradient.addColorStop(1, frameConfig.gradient[1]);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = frameConfig.color;
      }
      
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // 2. Draw Photos
      for (let i = 0; i < totalIterations; i++) {
        // Determine which photo to show
        let img: HTMLImageElement;
        
        if (layout === 'polaroid') {
            img = loadedImages[currentPhotoIndex % loadedImages.length];
        } else {
            // Cycle through available photos
            img = loadedImages[i % loadedImages.length];
        }

        const colIndex = i % cols;
        const rowIndex = Math.floor(i / cols);

        const x = margin + (colIndex * (photoWidth + spacing));
        const y = margin + (rowIndex * (photoHeight + spacing));

        // Object cover effect logic for canvas
        const sWidth = img.width;
        const sHeight = img.height;
        // We want to crop center 3:4
        const targetRatio = photoWidth / photoHeight;
        const sourceRatio = sWidth / sHeight;
        
        let sx, sy, sCropWidth, sCropHeight;
        
        if (sourceRatio > targetRatio) {
           // Source is wider, crop width
           sCropHeight = sHeight;
           sCropWidth = sHeight * targetRatio;
           sx = (sWidth - sCropWidth) / 2;
           sy = 0;
        } else {
           // Source is taller, crop height
           sCropWidth = sWidth;
           sCropHeight = sWidth / targetRatio;
           sx = 0;
           sy = (sHeight - sCropHeight) / 2;
        }

        // Apply filter: use ctx.filter on desktop (faster), manual on mobile (compatible)
        if (filter === 'original') {
          ctx.drawImage(img, sx, sy, sCropWidth, sCropHeight, x, y, photoWidth, photoHeight);
        } else if (!isMobile && 'filter' in ctx) {
          // Use native ctx.filter on desktop (faster and hardware accelerated)
          ctx.save();
          if (filter === 'instax') {
            ctx.filter = 'contrast(1.15) brightness(1.1) saturate(1.2) sepia(0.1)';
          } else if (filter === 'vintage') {
            ctx.filter = 'sepia(0.4) contrast(0.85) brightness(1.1) saturate(0.8)';
          }
          ctx.drawImage(img, sx, sy, sCropWidth, sCropHeight, x, y, photoWidth, photoHeight);
          ctx.restore();
        } else {
          // Use manual pixel manipulation on mobile (better compatibility)
          applyFilterToImage(ctx, img, sx, sy, sCropWidth, sCropHeight, x, y, photoWidth, photoHeight, filter);
        }

        // Optional: Inner shadow or border
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, photoWidth, photoHeight);
      }

      // 3. Draw Text/Logo at bottom - caption centered in bottom area
      const bottomAreaTop = totalHeight - bottomAreaHeight;
      const bottomAreaCenter = bottomAreaTop + (bottomAreaHeight / 2);
      
      ctx.fillStyle = frameConfig.textColor;
      ctx.textAlign = 'center';
      
      // Date - High resolution font size
      const dateFontSize = 40;
      const captionFontSize = 80;
      // No line spacing between date and caption
      const lineSpacing = 0;
      
      // Caption baseline - centered in bottom area
      // fillText draws from baseline, so we position caption at center
      const captionBaseline = bottomAreaCenter;
      
      // Date baseline - positioned directly above caption with no spacing
      const dateBaseline = captionBaseline - captionFontSize;
      
      // Draw Date
      ctx.font = `500 ${dateFontSize}px Gaegu`; 
      ctx.fillText(date, totalWidth / 2, dateBaseline);

      // Draw Caption - positioned below date with line spacing
      ctx.font = `700 ${captionFontSize}px Gaegu`; 
      ctx.fillText(caption, totalWidth / 2, captionBaseline);
      
      // Branding watermark
      // ctx.font = '400 30px Gaegu';
      // ctx.globalAlpha = 0.6;
      // ctx.fillText("Life4Cuts", totalWidth / 2, totalHeight - 40);
      // ctx.globalAlpha = 1.0;
    };

    drawCanvas();
  }, [loadedImages, frameConfig, caption, date, filter, currentPhotoIndex, windowWidth]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `life4cuts-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleAiCaption = async () => {
    if (!vibeInput.trim()) {
        alert("Enter a vibe first!");
        return;
    }
    setIsGenerating(true);
    const newCaption = await generateCaption(vibeInput);
    setCaption(newCaption);
    setIsGenerating(false);
  };

  const handleCanvasClick = () => {
    if (frameConfig.layout === 'polaroid') {
        setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fff0f5] overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-white/80 backdrop-blur-sm shadow-sm z-10 flex-shrink-0">
        <button 
          onClick={onRetake} 
          className="text-gray-500 flex items-center gap-1 font-bold hover:text-pink-500 transition active:scale-95 min-h-[44px] px-2"
        >
          <ChevronLeft size={20} className="md:w-6 md:h-6" /> 
          <span className="hidden sm:inline">Retake</span>
        </button>
        <h2 className="font-bold text-base md:text-xl text-pink-500">Edit Strip</h2>
        <button 
          onClick={handleDownload} 
          className="bg-pink-500 text-white px-3 md:px-5 py-2 rounded-full flex items-center gap-1 md:gap-2 text-sm md:text-lg font-bold shadow-[2px_2px_0px_0px_rgba(200,100,150,1)] active:shadow-none active:translate-y-[2px] transition min-h-[44px]"
        >
          <Download size={18} className="md:w-5 md:h-5" /> 
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-3 md:p-4 max-w-6xl mx-auto w-full overflow-hidden min-h-0">
        
        {/* Preview Area - Fixed, no scroll */}
        <div className="flex-1 flex justify-center items-center bg-pink-100/50 rounded-2xl md:rounded-3xl p-3 md:p-6 lg:p-8 overflow-hidden border-2 md:border-4 border-white border-dashed relative min-h-0 md:min-h-0">
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col gap-2">
                {frameConfig.layout === 'polaroid' && (
                    <span className="bg-white/80 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-pink-500 shadow-sm animate-pulse">
                        Tap photo to change
                    </span>
                )}
            </div>
            
          {/* Canvas */}
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
            className={`shadow-2xl max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 ${frameConfig.layout === 'polaroid' ? 'cursor-pointer' : ''}`}
            style={{ borderRadius: '2px' }}
          />
        </div>

        {/* Controls Area - Tabs on mobile, scrollable on desktop */}
        <div className="w-full md:w-80 flex flex-col bg-white rounded-2xl md:rounded-3xl shadow-sm border-2 border-pink-100 flex-shrink-0 md:flex-shrink overflow-hidden">
          
          {/* Mobile: Tab Navigation - Fixed height one row */}
          <div className="md:hidden flex border-b-2 border-pink-100 bg-pink-50/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-1 min-w-0 px-2 py-3 transition flex items-center justify-center ${activeTab === 'layout' ? 'bg-white text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setActiveTab('color')}
              className={`flex-1 min-w-0 px-2 py-3 transition flex items-center justify-center ${activeTab === 'color' ? 'bg-white text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
            >
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" style={{ background: frameConfig.gradient ? `linear-gradient(135deg, ${frameConfig.gradient[0]}, ${frameConfig.gradient[1]})` : frameConfig.color }} />
            </button>
            <button
              onClick={() => setActiveTab('filter')}
              className={`flex-1 min-w-0 px-2 py-3 transition flex items-center justify-center ${activeTab === 'filter' ? 'bg-white text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
            >
              <Wand2 size={20} />
            </button>
            <button
              onClick={() => setActiveTab('caption')}
              className={`flex-1 min-w-0 px-2 py-3 transition flex items-center justify-center ${activeTab === 'caption' ? 'bg-white text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
            >
              <Type size={20} />
            </button>
            <button
              onClick={() => setActiveTab('magic')}
              className={`flex-1 min-w-0 px-2 py-3 transition flex items-center justify-center ${activeTab === 'magic' ? 'bg-white text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
            >
              <Sparkles size={20} />
            </button>
          </div>

          {/* Mobile: Tab Content - Fixed height container (one row worth of content) */}
          <div className="md:hidden p-4 h-[120px] flex items-center">
            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="w-full">
                <div className="grid grid-cols-4 gap-1 bg-pink-50 p-1 rounded-xl">
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'strip'}))}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'strip' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Strip"
                >
                    <Columns size={18} />
                </button>
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'grid'}))}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'grid' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Grid 2x2"
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'grid3x3'}))}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'grid3x3' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Grid 3x3"
                >
                    <Grid3x3 size={18} />
                </button>
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'polaroid'}))}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'polaroid' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Single"
                >
                    <Square size={18} />
                </button>
            </div>
          </div>
            )}

            {/* Color Tab */}
            {activeTab === 'color' && (
              <div className="w-full">
                <div className="overflow-x-auto overflow-y-visible pb-2 -mx-4 px-4 pt-2">
                  <div className="flex gap-2 min-w-max items-center py-1">
                {FRAME_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setFrameConfig(p => ({ ...p, color: c.hex, textColor: c.text, gradient: c.gradient }))}
                    className={`flex-shrink-0 w-11 h-11 rounded-full border-2 transition active:scale-95 min-h-[44px] ${frameConfig.color === c.hex ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                    style={{ 
                      background: c.gradient ? `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` : c.hex 
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
              </div>
            )}

            {/* Filter Tab */}
            {activeTab === 'filter' && (
              <div className="w-full">
                <div className="flex bg-pink-50 p-1 rounded-xl gap-1">
                  <button 
                    onClick={() => setFilter('original')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition active:scale-95 min-h-[44px] ${filter === 'original' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  >
                    Original
                  </button>
                  <button 
                    onClick={() => setFilter('instax')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition active:scale-95 min-h-[44px] ${filter === 'instax' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  >
                    Instax ✨
                  </button>
                  <button 
                    onClick={() => setFilter('vintage')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition active:scale-95 min-h-[44px] ${filter === 'vintage' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  >
                    Vintage 🎞️
                  </button>
                </div>
              </div>
            )}

            {/* Caption Tab */}
            {activeTab === 'caption' && (
              <div className="w-full">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full border-2 border-pink-100 rounded-xl px-3 py-2.5 font-handwritten text-lg focus:border-pink-300 outline-none text-gray-700 bg-pink-50/50 min-h-[44px]"
                  maxLength={20}
                  placeholder="Enter caption..."
                />
              </div>
            )}

            {/* Magic Tab */}
            {activeTab === 'magic' && (
              <div className="w-full">
                <div className="flex gap-2 items-stretch">
                  <input 
                    type="text" 
                    placeholder="Describe vibe..." 
                    value={vibeInput}
                    onChange={(e) => setVibeInput(e.target.value)}
                    className="flex-1 text-base border-2 border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-purple-300 bg-purple-50 min-w-0 min-h-[44px]"
                  />
                  <button 
                    onClick={handleAiCaption}
                    disabled={isGenerating}
                    className="bg-purple-400 text-white px-3 rounded-xl hover:bg-purple-500 disabled:opacity-50 transition shadow-[0_3px_0_rgba(168,85,247,0.3)] active:shadow-none active:translate-y-1 flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px]"
                  >
                    {isGenerating ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Original scrollable layout */}
          <div className="hidden md:flex md:flex-col md:gap-4 md:gap-6 md:p-6 md:overflow-y-auto md:h-auto">
            {/* Layout Toggle */}
            <div>
              <label className="text-xl font-bold text-gray-400 mb-2 block">Layout</label>
              <div className="grid grid-cols-4 gap-1 bg-pink-50 p-1 rounded-2xl">
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'strip'}))}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'strip' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Strip"
                >
                  <Columns size={20} />
                  <span className="text-xs font-bold">Strip</span>
                </button>
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'grid'}))}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'grid' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Grid 2x2"
                >
                  <LayoutGrid size={20} />
                  <span className="text-xs font-bold">2x2</span>
                </button>
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'grid3x3'}))}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'grid3x3' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Grid 3x3"
                >
                  <Grid3x3 size={20} />
                  <span className="text-xs font-bold">3x3</span>
                </button>
                <button 
                  onClick={() => setFrameConfig(p => ({...p, layout: 'polaroid'}))}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl transition active:scale-95 min-h-[48px] gap-1 ${frameConfig.layout === 'polaroid' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                  title="Single"
                >
                  <Square size={20} />
                  <span className="text-xs font-bold">Single</span>
                </button>
              </div>
            </div>

            {/* Frame Color */}
            <div>
              <label className="text-xl font-bold text-gray-400 mb-2 block">Frame Color</label>
              <div className="grid grid-cols-5 gap-3">
              {FRAME_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setFrameConfig(p => ({ ...p, color: c.hex, textColor: c.text, gradient: c.gradient }))}
                  className={`w-full aspect-square rounded-full border-2 transition hover:scale-110 ${frameConfig.color === c.hex ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                  style={{ 
                    background: c.gradient ? `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` : c.hex 
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

            {/* Filter Section */}
          <div>
              <label className="text-xl font-bold text-gray-400 mb-2 block">Filter</label>
              <div className="flex bg-pink-50 p-1 rounded-2xl gap-1">
                <button 
                  onClick={() => setFilter('original')}
                  className={`flex-1 py-3 text-lg font-bold rounded-xl transition active:scale-95 min-h-[44px] ${filter === 'original' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                >
                  Original
                </button>
                <button 
                  onClick={() => setFilter('instax')}
                  className={`flex-1 py-3 text-lg font-bold rounded-xl transition active:scale-95 min-h-[44px] ${filter === 'instax' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                >
                  Instax ✨
                </button>
                <button 
                  onClick={() => setFilter('vintage')}
                  className={`flex-1 py-3 text-lg font-bold rounded-xl transition active:scale-95 min-h-[44px] ${filter === 'vintage' ? 'bg-white shadow text-pink-500' : 'text-gray-400'}`}
                >
                  Vintage 🎞️
                </button>
            </div>
          </div>

            {/* Caption Input */}
          <div>
              <label className="text-xl font-bold text-gray-400 mb-2 block">Caption</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  className="flex-1 border-2 border-pink-100 rounded-xl px-4 py-3 font-handwritten text-2xl focus:border-pink-300 outline-none text-gray-700 bg-pink-50/50 min-w-0 min-h-[44px]"
                    maxLength={20}
                />
            </div>
          </div>

            {/* AI Generator */}
            <div className="bg-purple-50 p-4 lg:p-5 rounded-3xl border border-purple-100">
             <div className="flex items-center gap-2 mb-2">
                <Wand2 size={20} className="text-purple-400" />
                <label className="text-xl font-bold text-purple-400">Magic Caption</label>
             </div>
              <p className="text-lg text-purple-300 mb-3 leading-tight">Describe your vibe...</p>
             <div className="flex gap-2 items-stretch">
                <input 
                    type="text" 
                    placeholder="e.g. Besties" 
                    value={vibeInput}
                    onChange={(e) => setVibeInput(e.target.value)}
                  className="flex-1 text-lg border-2 border-purple-100 rounded-xl px-3 py-2 outline-none focus:border-purple-300 bg-white min-w-0 min-h-[44px]"
                />
                <button 
                    onClick={handleAiCaption}
                    disabled={isGenerating}
                  className="bg-purple-400 text-white px-4 rounded-xl hover:bg-purple-500 disabled:opacity-50 transition shadow-[0_3px_0_rgba(168,85,247,0.3)] active:shadow-none active:translate-y-1 flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px]"
                >
                  {isGenerating ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={20} />}
                </button>
              </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;
