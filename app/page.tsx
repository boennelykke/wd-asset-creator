'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Type, 
  Image as ImageIcon,
  Zap,
  Layout,
  Loader2,
  FileCode,
  Upload,
  Bold,
  AlignLeft,
  AlignCenter,
  LayoutPanelTop,
  BoxSelect,
  Maximize,
  Minimize,
  Film,
  MoveDiagonal,
  CreditCard,
  Layers,
  MousePointer2,
  Copy,
  MessageSquare,
  Video,
  Download
} from 'lucide-react';

// --- REMOTION SIMULATION HELPERS ---

const useCurrentFrame = (
  isPlaying: boolean,
  durationInFrames: number,
  fps: number = 30
) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let requestRef: number;
    let lastTime: number | undefined;

    const animate = (time: number) => {
      if (lastTime !== undefined) {
        const deltaTime = time - lastTime;
        const framesToAdvance = (deltaTime * fps) / 1000;
        
        setFrame((prev) => {
          const nextFrame = prev + framesToAdvance;
          return nextFrame >= durationInFrames ? 0 : nextFrame;
        });
      }
      lastTime = time;
      requestRef = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      requestRef = requestAnimationFrame(animate);
    }
    
    return () => cancelAnimationFrame(requestRef);
  }, [isPlaying, durationInFrames, fps]);

  return Math.floor(frame);
};

const interpolate = (frame: number, inputRange: [number, number], outputRange: [number, number]) => {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;

  if (frame <= inputMin) return outputMin;
  if (frame >= inputMax) return outputMax;

  const progress = (frame - inputMin) / (inputMax - inputMin);
  return outputMin + progress * (outputMax - outputMin);
};

// --- CONSTANTS ---

const BRAND_COLORS = [
  { id: 'white', label: 'White', hex: '#ffffff' }, 
  { id: 'dark_blue', label: 'Dark Blue', hex: '#003865' },
  { id: 'workday_blue', label: 'Workday Blue', hex: '#0051db' },
  { id: 'midnight', label: 'Midnight', hex: '#08112e' },
  { id: 'obsidian', label: 'Obsidian', hex: '#111111' },
  { id: 'sky', label: 'Sky', hex: '#3695ff' },
  { id: 'teal', label: 'Teal', hex: '#038387' },
  { id: 'green', label: 'Green', hex: '#1c7d41' },
  { id: 'orange', label: 'Orange', hex: '#e66000' },
  { id: 'red', label: 'Red', hex: '#de2e21' },
  { id: 'berry', label: 'Berry', hex: '#a31a64' },
  { id: 'purple', label: 'Purple', hex: '#6e3dc2' },
];

const FORMATS: Record<string, { label: string; ratio: string; h: string; desc: string }> = {
  ig_story: { label: "IG Story", ratio: "aspect-[9/16]", h: "640px", desc: "1080x1920" },
  ig_post: { label: "IG/LI Square", ratio: "aspect-square", h: "500px", desc: "1080x1080" },
  li_portrait: { label: "LI Portrait", ratio: "aspect-[4/5]", h: "550px", desc: "1080x1350" },
  li_wide: { label: "LI Wide", ratio: "aspect-[16/9]", h: "300px", desc: "1920x1080" }
};

const LAYOUTS: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    desc: string;
  }
> = {
  poster: { label: "Poster", icon: AlignCenter, desc: "Classic Center" },
  swiss: { label: "Swiss", icon: AlignLeft, desc: "Grid System" },
  split: { label: "Split", icon: LayoutPanelTop, desc: "Half & Half" },
  frame: { label: "Frame", icon: BoxSelect, desc: "Inset Border" },
  bold: { label: "Bold", icon: Maximize, desc: "Max Impact" },
  minimal: { label: "Minimal", icon: Minimize, desc: "Micro Type" },
  cinema: { label: "Cinema", icon: Film, desc: "Letterbox" },
  diagonal: { label: "Diagonal", icon: MoveDiagonal, desc: "Dynamic Angle" },
  cards: { label: "Cards", icon: CreditCard, desc: "Floating Surface" },
  stack: { label: "Stack", icon: Layers, desc: "Vertical Depth" },
  corner: { label: "Corner", icon: MousePointer2, desc: "Anchor Point" },
  overlap: { label: "Overlap", icon: Copy, desc: "Interlock" },
};

const BACKGROUNDS = [
  {
    id: 'workday_1',
    url: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // new background image
    style: { background: 'linear-gradient(135deg, #42C5F5 0%, #6D73F9 100%)' } // WD Blue to WD Indigo
  },
  {
    id: 'workday_2',
    url: 'https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // new background image
    style: { background: 'linear-gradient(135deg, #FDF497 0%, #FD5949 50%, #D6249F 100%)' } // Yellow-Pink-Violet (Insta style)
  },
  {
    id: 'workday_3',
    url: 'https://images.unsplash.com/photo-1717511217900-1ab1c6448d48?auto=format&fit=crop&q=80', // placeholder
    style: { background: 'linear-gradient(120deg, #F3ECD5 0%, #F5A366 100%)' } // Light beige to apricot
  },
  {
    id: 'workday_4',
    url: 'https://images.unsplash.com/photo-1717511307289-68fa5b68552b?auto=format&fit=crop&q=80', // placeholder
    style: { background: 'linear-gradient(110deg, #7DD3FC 0%, #38BDF8 100%)' } // Sky Blue to Blue
  },
  {
    id: 'workday_5',
    url: 'https://images.unsplash.com/photo-1717511393552-0afa6fae5e3c?auto=format&fit=crop&q=80', // placeholder
    style: { background: 'linear-gradient(120deg, #FEB692 0%, #EA5455 100%)' } // Apricot to Red
  }
];

const ANIMATIONS: Record<
  string,
  (frame: number) => React.CSSProperties
> = {
  slide: (frame) => ({
    opacity: interpolate(frame, [0, 20], [0, 1]),
    transform: `translateY(${interpolate(frame, [0, 25], [100, 0])}px)`,
  }),
  blur: (frame) => ({
    opacity: interpolate(frame, [0, 20], [0, 1]),
    filter: `blur(${interpolate(frame, [0, 20], [20, 0])}px)`,
    transform: `scale(${interpolate(frame, [0, 20], [1.1, 1])})`,
  }),
  z_space: (frame) => ({
    opacity: interpolate(frame, [0, 15], [0, 1]),
    transform: `scale(${interpolate(frame, [0, 30], [3, 1])})`,
  }),
  fade: (frame) => ({
    opacity: interpolate(frame, [0, 30], [0, 1]),
  })
};

const BG_ANIMATIONS: Record<
  string,
  (frame: number, duration: number) => React.CSSProperties
> = {
  none: () => ({}),
  zoom: (frame, duration) => ({
    transform: `scale(${interpolate(frame, [0, duration], [1, 1.25])})`
  }),
  pan: (frame, duration) => ({
    transform: `scale(1.2) translateX(${interpolate(frame, [0, duration], [-20, 20])}px)`
  }),
  pulse: (frame) => ({
    transform: `scale(${1 + Math.sin(frame / 45) * 0.08})`
  })
};

export default function Home() {
  // Config
  const FPS = 30;
  
  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [text, setText] = useState("The future of a work day is hair.");
  
  // Design State
  const [activeColor, setActiveColor] = useState('white');
  const [activeFormat, setActiveFormat] = useState<keyof typeof FORMATS>('ig_story');
  const [activeLayout, setActiveLayout] = useState<keyof typeof LAYOUTS>('poster');
  const [fontWeight, setFontWeight] = useState<'regular' | 'bold' | 'extrabold'>('extrabold'); 
  const [lineHeight, setLineHeight] = useState(1.0);
  const [fontSize, setFontSize] = useState(0.8);
  const [textShadow, setTextShadow] = useState<'none' | 'soft' | 'hard'>('none');
  const [bgAnimation, setBgAnimation] = useState<keyof typeof BG_ANIMATIONS>('zoom');
  
  // CTA State
  const [showCta, setShowCta] = useState(true);
  const [ctaText, setCtaText] = useState("Learn More");

  // Asset State
  const [activeBg, setActiveBg] = useState(BACKGROUNDS[0].url);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoBox, setLogoBox] = useState(false);
  
  // Animation State
  const [animationType, setAnimationType] = useState<keyof typeof ANIMATIONS>('slide');
  const [durationSec, setDurationSec] = useState(5);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderingMode, setRenderingMode] = useState<'html' | 'video' | null>(null); // 'html' or 'video'

  // File Inputs Refs
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const durationInFrames = durationSec * FPS;
  const frame = useCurrentFrame(isPlaying && !isRendering, durationInFrames, FPS);

  // Derived Values
  const currentBg = customBg || activeBg;
  const currentAnimStyle = ANIMATIONS[animationType](frame);
  const currentBgAnim = BG_ANIMATIONS[bgAnimation](frame, durationInFrames);
  
  // Helpers
  const textColorObj = BRAND_COLORS.find(c => c.id === activeColor) || BRAND_COLORS[0];
  
  const getFontClass = () => {
    if (fontWeight === 'regular') return 'font-normal';
    if (fontWeight === 'bold') return 'font-bold';
    return 'font-[900]';
  };

  const getShadowClass = () => {
    if (textShadow === 'soft') return 'drop-shadow-md';
    if (textShadow === 'hard') return 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]';
    return '';
  };

  // --- EXPORT HANDLERS ---

  const handleHtmlExport = () => {
    setRenderingMode('html');
    setIsRendering(true);
    setRenderProgress(0);
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setRenderProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          generateHTML5Export();
          setIsRendering(false);
          setRenderingMode(null);
        }, 500);
      }
    }, 100);
  };

  const handleVideoExport = () => {
    setRenderingMode('video');
    setIsRendering(true);
    setRenderProgress(0);
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setRenderProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          generateHTML5Export(true); // true = name it similar to video
          setIsRendering(false);
          setRenderingMode(null);
        }, 500);
      }
    }, 100);
  };

  // --- HTML5 EXPORT GENERATOR ---
  const generateHTML5Export = (isVideoMode = false) => {
    const baseClasses = `${getFontClass()} ${getShadowClass()} tracking-tight`;
    const baseStyle = `color: ${textColorObj.hex}; line-height: ${lineHeight};`;
    
    // Helper to escape text for HTML
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let layoutHtml = '';
    // --- LAYOUT HTML GENERATION ---
    switch(activeLayout) {
      case 'poster':
        layoutHtml = `
          <div class="absolute inset-0 flex items-center justify-center p-12 z-10 anim-content">
             <h1 class="${baseClasses} text-center" style="${baseStyle} font-size: ${5 * fontSize}rem;">${safeText}</h1>
          </div>`;
        break;
      case 'swiss':
        layoutHtml = `
          <div class="absolute inset-0 p-12 flex flex-col justify-between z-10">
             <div class="w-full h-[1px] opacity-20" style="background-color: ${textColorObj.hex}"></div>
             <div class="max-w-lg anim-content">
                <h1 class="${baseClasses} text-left" style="${baseStyle} font-size: ${4 * fontSize}rem; letter-spacing: -0.03em;">${safeText}</h1>
             </div>
          </div>`;
        break;
      case 'bold':
        layoutHtml = `
          <div class="absolute inset-0 flex items-center justify-center p-4 z-10 anim-content">
             <h1 class="${baseClasses} text-center break-words w-full" style="${baseStyle} font-size: ${6 * fontSize}rem; letter-spacing: -0.04em;">${safeText}</h1>
          </div>`;
        break;
      case 'minimal':
        layoutHtml = `
          <div class="absolute inset-0 flex items-center justify-center p-12 z-10 anim-content">
             <div class="text-center">
               <h1 class="${baseClasses} uppercase font-medium" style="${baseStyle} font-size: ${1.5 * fontSize}rem; letter-spacing: 0.2em;">${safeText}</h1>
               <div class="w-8 h-0.5 mx-auto mt-6" style="background-color: ${textColorObj.hex}"></div>
             </div>
          </div>`;
        break;
      case 'cinema':
        layoutHtml = `
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none z-10">
             <div class="h-[12%] bg-black w-full"></div>
             <div class="flex-1 flex items-center justify-center anim-content">
                <h1 class="${baseClasses} text-center max-w-3xl" style="${baseStyle} font-size: ${4 * fontSize}rem; text-shadow: 0 10px 30px rgba(0,0,0,0.5); color: white;">${safeText}</h1>
             </div>
             <div class="h-[12%] bg-black w-full"></div>
          </div>`;
        break;
      case 'diagonal':
        layoutHtml = `
          <div class="absolute inset-0 flex items-center justify-center overflow-hidden z-10">
             <div class="w-[150%] py-20 text-center anim-content" style="transform: rotate(-10deg);">
                <h1 class="${baseClasses}" style="${baseStyle} font-size: ${5 * fontSize}rem;">${safeText}</h1>
             </div>
          </div>`;
        break;
      case 'cards':
        layoutHtml = `
          <div class="absolute inset-0 flex items-center justify-center p-8 z-10 anim-content">
             <div class="max-w-xl text-left">
                <div class="w-12 h-1.5 mb-8 rounded-full" style="background-color: ${textColorObj.hex}"></div>
                <h1 class="${baseClasses} leading-tight mb-4" style="${baseStyle} font-size: ${3.5 * fontSize}rem;">${safeText}</h1>
             </div>
          </div>`;
        break;
      case 'stack':
        layoutHtml = `
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-0 z-10">
             <h1 class="${baseClasses} anim-content opacity-100" style="${baseStyle} font-size: ${4.5 * fontSize}rem; line-height: 0.85;">${safeText}</h1>
             <h1 class="${baseClasses} anim-content opacity-75" style="${baseStyle} font-size: ${4.5 * fontSize}rem; line-height: 0.85; animation-delay: 0.1s;">${safeText}</h1>
             <h1 class="${baseClasses} anim-content opacity-50" style="${baseStyle} font-size: ${4.5 * fontSize}rem; line-height: 0.85; animation-delay: 0.2s;">${safeText}</h1>
          </div>`;
        break;
      case 'corner':
        layoutHtml = `
          <div class="absolute inset-0 p-8 flex flex-col justify-start items-end text-right z-10 anim-content">
             <h1 class="${baseClasses} max-w-[400px] leading-tight" style="${baseStyle} font-size: ${3 * fontSize}rem;">${safeText}</h1>
          </div>`;
        break;
      case 'overlap':
        layoutHtml = `
          <div class="absolute inset-0 flex items-center justify-center z-10 anim-content">
             <div class="absolute opacity-30" style="transform: translate(-15px, -15px);"><h1 class="${baseClasses}" style="${baseStyle} font-size: ${4 * fontSize}rem;">${safeText}</h1></div>
             <div class="relative" style="transform: translate(15px, 15px);"><h1 class="${baseClasses}" style="${baseStyle} font-size: ${4 * fontSize}rem;">${safeText}</h1></div>
          </div>`;
        break;
      case 'split':
        layoutHtml = `
          <div class="absolute inset-0 flex flex-col z-10">
             <div class="h-[50%] w-full"></div>
             <div class="h-[50%] w-full flex flex-col items-center justify-center text-center p-8">
                <div class="anim-content"><h1 class="${baseClasses}" style="${baseStyle} font-size: ${3 * fontSize}rem;">${safeText}</h1></div>
             </div>
          </div>`;
        break;
      case 'frame':
        layoutHtml = `
          <div class="absolute inset-0 p-12 z-10 flex items-center justify-center">
             <div class="w-full h-full border-[2px] flex items-center justify-center p-8 relative" style="border-color: ${textColorObj.hex}">
                <div class="anim-content text-center"><h1 class="${baseClasses}" style="${baseStyle} font-size: ${4 * fontSize}rem;">${safeText}</h1></div>
             </div>
          </div>`;
        break;
      default:
        layoutHtml = `<div class="absolute inset-0 flex items-center justify-center p-12 z-10 anim-content"><h1 class="${baseClasses} text-center" style="${baseStyle} font-size: ${5 * fontSize}rem;">${safeText}</h1></div>`;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workday Asset Export</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&display=swap');
        body { margin: 0; background: #111; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: 'Archivo', sans-serif; overflow: hidden; }
        
        @keyframes slide { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blur { from { opacity: 0; filter: blur(20px); transform: scale(1.1); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
        @keyframes z_space { from { opacity: 0; transform: scale(3); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        
        @keyframes zoomBg { from { transform: scale(1); } to { transform: scale(1.25); } }
        @keyframes panBg { from { transform: scale(1.2) translateX(-20px); } to { transform: scale(1.2) translateX(20px); } }
        @keyframes pulseBg { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }

        .anim-content { animation: ${animationType} 1s ease-out forwards; }
        .anim-bg { animation: ${bgAnimation === 'none' ? 'none' : bgAnimation + 'Bg'} ${durationSec}s linear infinite alternate; }
    </style>
</head>
<body>
    <div class="relative overflow-hidden bg-black ${FORMATS[activeFormat].ratio.replace('aspect-', 'aspect-')}" 
         style="height: 100vh; max-height: 90vh; width: auto; aspect-ratio: ${FORMATS[activeFormat].ratio === 'aspect-[9/16]' ? '9/16' : FORMATS[activeFormat].ratio === 'aspect-square' ? '1/1' : FORMATS[activeFormat].ratio === 'aspect-[4/5]' ? '4/5' : '16/9'};">
         
         <!-- Background -->
         <div class="absolute inset-0 bg-cover bg-center anim-bg" 
              style="background-image: url('${currentBg}'); filter: ${activeLayout === 'split' ? 'brightness(1.05)' : 'brightness(1)'}"></div>

         ${layoutHtml}

         <!-- CTA -->
         ${showCta ? `
         <div class="absolute bottom-16 left-0 right-0 flex justify-center z-20 anim-content" style="animation-delay: 0.3s; opacity: 0;">
              <div class="bg-white/95 backdrop-blur-md text-[#003865] px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-xl border border-white/50">
                ${ctaText}
              </div>
         </div>` : ''}

         <!-- Logo -->
         ${logo ? `<img src="${logo}" class="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 object-contain z-30" />` : ''}
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Naming convention: .html for HTML5, .mp4.html for Video attempt (to signal it's a video asset wrapper)
    link.download = isVideoMode ? `workday-asset-${activeFormat}.html` : `workday-interactive-${activeFormat}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  // --- LAYOUT RENDERERS (Box-Free) ---
  
  const renderLayoutContent = () => {
    const commonClasses = `${getFontClass()} tracking-tight transition-all duration-300 ${getShadowClass()}`;
    const textStyle: React.CSSProperties = { 
      color: textColorObj.hex,
      lineHeight: lineHeight,
    };

    const getDynamicSize = (baseSize: number) => {
       return { fontSize: `${baseSize * fontSize}rem` };
    };

    // Wrapper for CTA injection
    const ContentWrapper: React.FC<{
      children: React.ReactNode;
      style?: React.CSSProperties;
    }> = ({ children, style = {} }) => (
      <div className="relative w-full h-full" style={style}>
        {children}
        {showCta && (
           <div 
             className="absolute bottom-16 left-0 right-0 flex justify-center z-20"
             style={{ opacity: interpolate(frame, [20, 40], [0, 1]), transform: `translateY(${interpolate(frame, [20, 40], [20, 0])}px)` }}
           >
              <div className="bg-white/95 backdrop-blur-md text-[#003865] px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-xl border border-white/50">
                {ctaText}
              </div>
           </div>
        )}
      </div>
    );

    switch (activeLayout) {
      case 'bold':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div style={currentAnimStyle} className="w-full">
                <h2 className={`${commonClasses} text-center break-words w-full`} 
                    style={{ ...textStyle, ...getDynamicSize(6), letterSpacing: '-0.04em' }}>
                  {text || "BOLD"}
                </h2>
              </div>
            </div>
          </ContentWrapper>
        );
      case 'minimal':
         return (
          <ContentWrapper>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div style={currentAnimStyle}>
                <h2 className={`${commonClasses} tracking-[0.2em] uppercase text-center font-medium`} 
                    style={{...textStyle, ...getDynamicSize(1.5)}}>
                  {text || "Minimal"}
                </h2>
                <div className="w-8 h-[2px] bg-current mx-auto mt-6" style={{ color: textStyle.color }} />
              </div>
            </div>
          </ContentWrapper>
        );
      case 'swiss': 
        return (
          <ContentWrapper>
            <div className="absolute inset-0 p-12 flex flex-col justify-between z-10">
               <div className="w-full h-[1px] bg-current opacity-20" style={{ color: textStyle.color }} />
               <div style={currentAnimStyle} className="max-w-lg">
                  <h2 className={`${commonClasses} text-left`} 
                      style={{ ...textStyle, ...getDynamicSize(4), letterSpacing: '-0.03em' }}>
                    {text || "Enter text"}
                  </h2>
               </div>
            </div>
          </ContentWrapper>
        );
      case 'cinema':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
               <div className="h-[12%] bg-black w-full z-10" />
               <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div style={currentAnimStyle} className="max-w-3xl text-center">
                     <h2 className={`${commonClasses}`} 
                         style={{ ...textStyle, ...getDynamicSize(3.5), textShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'white' }}>
                        {text || "Cinema"}
                     </h2>
                  </div>
               </div>
               <div className="h-[12%] bg-black w-full z-10" />
            </div>
          </ContentWrapper>
        );
      case 'diagonal':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
               <div style={{ ...currentAnimStyle, transform: `${currentAnimStyle.transform ?? ''} rotate(-10deg)` }} className="w-[150%] py-20 text-center">
                   <h2 className={`${commonClasses}`} 
                       style={{ ...textStyle, ...getDynamicSize(5), letterSpacing: '-0.02em' }}>
                      {text || "Diagonal"}
                   </h2>
               </div>
            </div>
          </ContentWrapper>
        );
      case 'cards':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex items-center justify-center p-8">
               <div style={currentAnimStyle} className="max-w-xl text-left">
                  <div className="w-12 h-1.5 mb-8 rounded-full" style={{ backgroundColor: textStyle.color }} />
                  <h2 className={`${commonClasses} leading-tight mb-4`} style={{...textStyle, ...getDynamicSize(3.5)}}>
                     {text || "Card Title"}
                  </h2>
               </div>
            </div>
          </ContentWrapper>
        );
      case 'stack':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
               {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      opacity: interpolate(frame, [0 + i * 3, 10 + i * 3], [0, 1]),
                      transform: `translateY(${interpolate(frame, [0 + i * 3, 20 + i * 3], [20, 0])}px)`,
                    }}
                  >
                    <h2
                      className={commonClasses}
                      style={{
                        ...textStyle,
                        ...getDynamicSize(4.5),
                        lineHeight: 0.85,
                        opacity: 1 - i * 0.25,
                      }}
                    >
                      {text || "Stack"}
                    </h2>
                  </div>
               ))}
            </div>
          </ContentWrapper>
        );
      case 'corner':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 p-8 flex flex-col justify-start items-end text-right">
               <div style={currentAnimStyle} className="max-w-[400px]">
                  <h2 className={`${commonClasses} leading-tight`} style={{...textStyle, ...getDynamicSize(3)}}>
                     {text || "Corner View"}
                  </h2>
               </div>
            </div>
          </ContentWrapper>
        );
      case 'overlap':
        return (
          <ContentWrapper>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute" style={{ opacity: 0.3, transform: `translate(-15px, -15px)` }}>
                    <h2 className={commonClasses} style={{...textStyle, ...getDynamicSize(4), color: textStyle.color}}>{text}</h2>
                </div>
                <div className="relative" style={{ transform: `translate(15px, 15px)` }}>
                     <h2 className={commonClasses} style={{...textStyle, ...getDynamicSize(4)}}>{text}</h2>
                </div>
             </div>
          </ContentWrapper>
        );
      case 'split':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex flex-col z-10">
               <div className="h-[50%] w-full" />
               <div className="h-[50%] w-full flex flex-col items-center justify-center text-center p-8">
                  <div style={currentAnimStyle}>
                    <h2 className={commonClasses} style={{...textStyle, ...getDynamicSize(3)}}>
                      {text || "Enter text"}
                    </h2>
                  </div>
               </div>
            </div>
          </ContentWrapper>
        );
      case 'frame':
        return (
          <ContentWrapper>
            <div className="absolute inset-0 p-12 z-10 flex items-center justify-center">
               <div className="w-full h-full border-[2px] flex items-center justify-center p-8 relative" style={{ borderColor: textStyle.color }}>
                  <div style={currentAnimStyle} className="text-center">
                     <h2 className={commonClasses} style={{...textStyle, ...getDynamicSize(4)}}>
                       {text || "Enter text"}
                     </h2>
                  </div>
               </div>
            </div>
          </ContentWrapper>
        );
      case 'poster':
      default:
        return (
          <ContentWrapper>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
              <div style={currentAnimStyle}>
                <h2 className={`${commonClasses} drop-shadow-lg`} style={{...textStyle, ...getDynamicSize(5)}}>
                  {text || "Enter text"}
                </h2>
              </div>
            </div>
          </ContentWrapper>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F5F5F7] text-[#1D1D1F] font-['Archivo'] overflow-hidden transition-colors duration-500">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&display=swap');
        .archivo { font-family: 'Archivo', sans-serif; }
      `}</style>

      {/* LEFT: PREVIEW CANVAS */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#e8e8ed]">
        
        <div className="mb-6 flex items-center gap-4 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
          <Layout size={12} className="text-blue-600" /> 
          {FORMATS[activeFormat].label} — {FORMATS[activeFormat].desc}
        </div>

        {/* The "Remotion" Canvas Container */}
        <div 
          ref={canvasRef}
          className={`relative bg-white overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border border-neutral-200
            ${FORMATS[activeFormat].ratio}`}
          style={{ height: FORMATS[activeFormat].h }}
        >
          {/* Background Layer */}
          <div className="absolute inset-0 overflow-hidden">
             <div 
               className="w-full h-full bg-cover bg-center"
               style={{ 
                 backgroundImage: `url("${currentBg}")`,
                 ...currentBgAnim,
                 transition: 'transform 0.1s linear', 
                 filter: activeLayout === 'split' ? 'brightness(1.05)' : 'brightness(1)'
               }}
             />
          </div>

          {/* Logo Layer (2x Size) */}
          {logo && (
             <div className={`absolute z-30 transition-all duration-300
                ${activeLayout === 'swiss' ? 'top-12 left-12' : 'top-8 left-1/2 -translate-x-1/2'}
                ${logoBox ? 'bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-sm' : 'bg-transparent p-0'}`}
                style={{ width: logoBox ? '112px' : '128px', height: logoBox ? '112px' : '128px' }}
             >
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
             </div>
          )}

          {/* Dynamic Content Layer */}
          {renderLayoutContent()}

          {/* Frame Progress Bar (Hidden during render) */}
          {!isRendering && (
            <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full z-20">
              <div 
                className="h-full bg-[#0051db] transition-all duration-75" 
                style={{ width: `${(frame / durationInFrames) * 100}%` }} 
              />
            </div>
          )}

          {/* Render Overlay */}
          {isRendering && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="text-[#0051db] animate-spin mb-4" size={48} />
              <h3 className="text-xl font-bold mb-1 text-neutral-800">
                {renderingMode === 'html' ? 'Exporting HTML5...' : 'Generating Video Asset...'}
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-mono">
                {renderingMode === 'html' ? 'Bundling Assets & Animations' : 'Preparing Standalone File'}
              </p>
              <div className="w-full max-w-xs h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                 <div className="h-full bg-[#0051db] transition-all duration-300" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="mt-8 flex items-center gap-4 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/60 shadow-lg text-neutral-700">
          <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-blue-600 transition-colors">
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button onClick={() => window.location.reload()} className="hover:text-blue-600 transition-colors">
            <RotateCcw size={18} />
          </button>
          <div className="h-4 w-px bg-neutral-300 mx-2" />
          <span className="font-mono text-xs text-neutral-500">
            {Math.floor(frame/FPS)}s <span className="opacity-30">/</span> {durationSec}s
          </span>
        </div>
      </div>

      {/* RIGHT: EDITOR PANEL */}
      <div className="w-full lg:w-[450px] bg-white border-l border-neutral-200 p-6 overflow-y-auto custom-scrollbar shadow-2xl z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0051db] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-neutral-900">Kristian</h1>
              <span className="text-[9px] font-bold text-[#0051db] tracking-widest uppercase">Creative Asset Creator</span>
            </div>
          </div>
        </div>

        {/* GROUP 1: TEXT ENGINE */}
        <div className="space-y-6 mb-8 pb-8 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={12} /> Typography Engine
            </label>
          </div>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 60))}
            className="w-full bg-[#F5F5F7] border border-neutral-200 rounded-xl p-4 text-neutral-900 focus:outline-none focus:border-blue-400 transition-all resize-none h-24 archivo font-bold text-lg leading-tight placeholder:text-neutral-300"
            placeholder="Write something..."
          />
          
          <div className="grid grid-cols-2 gap-4">
             {/* Weight */}
             <div className="space-y-3">
                <span className="text-[9px] font-bold text-neutral-400 uppercase">Weight</span>
                <div className="flex bg-[#F5F5F7] rounded-lg p-1">
                   {['regular', 'bold', 'extrabold'].map((w) => (
                     <button 
                       key={w}
                       onClick={() => setFontWeight(w as 'regular' | 'bold' | 'extrabold')}
                       className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${fontWeight === w ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                     >
                       {w === 'extrabold' ? 'Hvy' : w.charAt(0).toUpperCase() + w.slice(1)}
                     </button>
                   ))}
                </div>
             </div>

             {/* Shadow */}
             <div className="space-y-3">
                <span className="text-[9px] font-bold text-neutral-400 uppercase">Shadow</span>
                <div className="flex bg-[#F5F5F7] rounded-lg p-1">
                   {['none', 'soft', 'hard'].map((s) => (
                     <button 
                       key={s}
                       onClick={() => setTextShadow(s as 'none' | 'soft' | 'hard')}
                       className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${textShadow === s ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                     >
                       {s}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Size & Line Height */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-[9px] font-bold text-neutral-400 uppercase">Size</span>
                 <span className="text-[9px] font-mono text-blue-500">x{fontSize.toFixed(1)}</span>
               </div>
               <input 
                 type="range" min="0.5" max="2.0" step="0.1"
                 value={fontSize}
                 onChange={(e) => setFontSize(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-[#F5F5F7] rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
            </div>
            <div className="space-y-2">
               <div className="flex justify-between">
                 <span className="text-[9px] font-bold text-neutral-400 uppercase">Height</span>
                 <span className="text-[9px] font-mono text-blue-500">{lineHeight.toFixed(1)}</span>
               </div>
               <input 
                 type="range" min="0.8" max="1.5" step="0.05"
                 value={lineHeight}
                 onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                 className="w-full h-1.5 bg-[#F5F5F7] rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
            </div>
          </div>
          
          <div className="space-y-2">
             <span className="text-[9px] font-bold text-neutral-400 uppercase">Brand Color</span>
             <div className="flex flex-wrap gap-2">
               {BRAND_COLORS.map((c) => (
                 <button
                   key={c.id}
                   onClick={() => setActiveColor(c.id)}
                   title={c.label}
                   className={`w-6 h-6 rounded-full border transition-all 
                     ${activeColor === c.id ? 'border-neutral-800 scale-125 shadow-md z-10' : 'border-transparent opacity-100 hover:scale-110'}`}
                   style={{ backgroundColor: c.hex }}
                 />
               ))}
             </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4 mb-8 pb-8 border-b border-neutral-100">
           <div className="flex items-center justify-between">
             <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
               <MessageSquare size={12} /> Call to Action
             </label>
             <button 
               onClick={() => setShowCta(!showCta)}
               className={`w-8 h-4 rounded-full transition-colors relative ${showCta ? 'bg-blue-500' : 'bg-neutral-200'}`}
             >
               <div className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all" style={{ left: showCta ? '18px' : '2px' }} />
             </button>
           </div>
           {showCta && (
             <input 
               type="text"
               value={ctaText}
               onChange={(e) => setCtaText(e.target.value)}
               className="w-full bg-[#F5F5F7] border border-neutral-200 rounded-lg p-3 text-sm font-bold text-neutral-900 focus:outline-none focus:border-blue-400"
             />
           )}
        </div>

        {/* GROUP 2: LAYOUT & FORMAT */}
        <div className="space-y-4 mb-8 pb-8 border-b border-neutral-100">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Layout size={12} /> Layout & Format
          </label>
          
          {/* Format Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(FORMATS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveFormat(key as keyof typeof FORMATS)}
                title={config.label}
                className={`flex items-center justify-center p-2 rounded-lg border transition-all ${activeFormat === key ? 'bg-neutral-800 border-neutral-800 text-white shadow-md' : 'bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300'}`}
              >
                <span className={`block border-2 border-current rounded-sm ${key === 'li_wide' ? 'w-6 h-3.5' : key === 'ig_story' ? 'w-3.5 h-6' : 'w-4 h-4'}`} />
              </button>
            ))}
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
             {Object.entries(LAYOUTS).map(([key, config]) => (
               <button
                 key={key}
                 onClick={() => setActiveLayout(key as keyof typeof LAYOUTS)}
                 className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group
                   ${activeLayout === key ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
               >
                 <config.icon size={18} className={activeLayout === key ? 'text-blue-500' : 'text-neutral-400 group-hover:text-neutral-600'} />
                 <div>
                   <div className="text-xs font-bold">{config.label}</div>
                   <div className="text-[9px] opacity-60">{config.desc}</div>
                 </div>
               </button>
             ))}
          </div>
        </div>

        {/* GROUP 3: ASSETS (BG + LOGO) */}
        <div className="space-y-4 mb-8 pb-8 border-b border-neutral-100">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={12} /> Visual Assets
          </label>
          
          {/* Backgrounds */}
          <div className="grid grid-cols-5 gap-2">
            <button 
              onClick={() => bgInputRef.current?.click()}
              className="aspect-square rounded-lg bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800 transition-colors group"
            >
              <Upload size={16} className="mb-1" />
              <span className="text-[8px] font-bold">UPLOAD</span>
              <input 
                 ref={bgInputRef}
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={(e) => handleFileUpload(e, (url) => setCustomBg(url))}
              />
            </button>
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => { setCustomBg(null); setActiveBg(bg.url); }}
                className={`aspect-square rounded-lg bg-cover bg-center border-2 transition-all shadow-sm
                  {!customBg && activeBg === bg.url ? 'border-neutral-800 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                style={{ backgroundImage: `url("${bg.url}")` }}
              />
            ))}
          </div>

          {/* Logo Upload */}
          <div className="flex flex-col gap-2 bg-[#F5F5F7] p-3 rounded-xl border border-neutral-200">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <div className={`w-10 h-10 flex items-center justify-center rounded-md ${logoBox ? 'bg-white border border-neutral-100' : 'bg-transparent'}`}>
                      <img src={logo} className="w-full h-full object-contain" alt="brand" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-neutral-200 rounded-md flex items-center justify-center">
                      <ImageIcon size={16} className="text-neutral-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-neutral-800">Brand Logo</div>
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="text-[10px] text-blue-500 hover:underline font-medium"
                    >
                      {logo ? "Replace Logo" : "Upload Logo"}
                    </button>
                  </div>
                </div>
                {logo && (
                  <button onClick={() => setLogo(null)} className="text-[10px] text-red-400 hover:text-red-500 font-medium">
                    Remove
                  </button>
                )}
             </div>
             
             {logo && (
               <label className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200 cursor-pointer">
                 <div 
                   onClick={() => setLogoBox(!logoBox)}
                   className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${logoBox ? 'bg-blue-500 border-blue-500' : 'bg-white border-neutral-300'}`}
                 >
                   {logoBox && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                 </div>
                 <span className="text-[10px] font-bold text-neutral-500">Show Logo Container Box</span>
               </label>
             )}
             
             <input 
                 ref={logoInputRef}
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={(e) => handleFileUpload(e, (url) => setLogo(url))}
              />
          </div>
        </div>

        {/* GROUP 4: ANIMATION */}
        <div className="space-y-4 mb-12">
           <div className="flex justify-between items-center">
             <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
               <Zap size={12} /> Animation Style
             </label>
             <span className="text-[10px] font-mono text-blue-500 font-bold">{durationSec}s</span>
           </div>
           
           <input 
             type="range" min="3" max="15" step="1" 
             value={durationSec}
             onChange={(e) => setDurationSec(parseInt(e.target.value, 10))}
             className="w-full h-1.5 bg-[#F5F5F7] rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
           />

           <div className="grid grid-cols-4 gap-2 mb-4">
             <button onClick={() => setAnimationType('slide')} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${animationType === 'slide' ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500'}`}>Slide Up</button>
             <button onClick={() => setAnimationType('blur')} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${animationType === 'blur' ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500'}`}>Blur In</button>
             <button onClick={() => setAnimationType('z_space')} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${animationType === 'z_space' ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500'}`}>Z-Space</button>
             <button onClick={() => setAnimationType('fade')} className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${animationType === 'fade' ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500'}`}>Fade</button>
           </div>
           
           <div className="grid grid-cols-4 gap-2">
              {Object.keys(BG_ANIMATIONS).map(anim => (
                <button
                  key={anim}
                  onClick={() => setBgAnimation(anim as keyof typeof BG_ANIMATIONS)}
                  className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${bgAnimation === anim ? 'bg-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500'}`}
                >
                  {anim}
                </button>
              ))}
           </div>
        </div>

        {/* RENDER BUTTONS */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t border-neutral-100 space-y-2">
          <button 
            disabled={isRendering}
            onClick={handleVideoExport}
            className={`w-full py-4 rounded-xl font-[900] text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20
              ${isRendering ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98]'}`}
          >
            {isRendering && renderingMode === 'video' ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Video size={18} />
            )}
            {isRendering && renderingMode === 'video' ? 'GENERATING...' : 'RENDER MP4'}
          </button>

          <button 
            disabled={isRendering}
            onClick={handleHtmlExport}
            className={`w-full py-3 rounded-xl font-[700] text-xs flex items-center justify-center gap-2 transition-all border border-neutral-200
              ${isRendering ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            {isRendering && renderingMode === 'html' ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <FileCode size={14} />
            )}
            {isRendering && renderingMode === 'html' ? 'EXPORTING...' : 'EXPORT HTML5 (LIGHTWEIGHT)'}
          </button>
        </div>
      </div>
    </div>
  );
}
