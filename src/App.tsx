import { useRef } from 'react';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useAudioSynthesis } from './hooks/useAudioSynthesis';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { jutsu } = useMediaPipe(videoRef, canvasRef);
  useAudioSynthesis(jutsu);

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth;
    snapCanvas.height = video.videoHeight;
    const ctx = snapCanvas.getContext('2d')!;

    // Draw video (mirrored)
    ctx.save();
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    ctx.restore();

    // Composite all active canvases (MediaPipe + Particles)
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(c => {
        ctx.drawImage(c, 0, 0, snapCanvas.width, snapCanvas.height);
    });

    const link = document.createElement('a');
    link.download = 'shinobi-snapshot.png';
    link.href = snapCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover -scale-x-100 z-0"
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full object-cover -scale-x-100 z-10 pointer-events-none"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-[#0a0500]/30 mix-blend-multiply pointer-events-none z-20" />
      
      {/* UI Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={takeSnapshot}
          className="px-8 py-3 bg-red-600/90 hover:bg-red-500 text-white text-lg font-bold rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all backdrop-blur-sm border border-red-400/30 flex items-center justify-center gap-3 whitespace-nowrap"
        >
          <span>📷 Capture Snapshot</span>
        </button>
      </div>

      {/* FX Videos */}
      <video id="n" className="absolute w-[1600px] h-auto top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden mix-blend-screen z-30" src="/assets/naruto.mp4" muted autoPlay loop playsInline></video>
      <video id="s" className="absolute w-[2400px] h-auto top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden mix-blend-screen z-30" src="/assets/sasuke.mp4" muted autoPlay loop playsInline></video>
      <video id="f" className="absolute w-[600px] h-auto top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden mix-blend-screen z-30" src="/assets/fireball.mp4" muted autoPlay loop playsInline></video>
    </div>
  );
}
