import { useRef } from 'react';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useAudioSynthesis } from './hooks/useAudioSynthesis';
import { useRecording } from './hooks/useRecording';

export default function MainApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { jutsu } = useMediaPipe(videoRef, canvasRef);
  const audioStream = useAudioSynthesis(jutsu);
  const { isRecording, toggleRecording } = useRecording(canvasRef, audioStream);

  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = canvas.width;
    snapCanvas.height = canvas.height;
    const ctx = snapCanvas.getContext('2d')!;

    // Mirror the final image
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, 0, 0, snapCanvas.width, snapCanvas.height);

    const a = document.createElement('a');
    a.href = snapCanvas.toDataURL('image/png');
    a.download = `shinobi-snapshot-${new Date().getTime()}.png`;
    a.click();
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
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4">
        <button 
          onClick={takeSnapshot}
          className="px-8 py-3 bg-cyan-600/90 hover:bg-cyan-500 text-white text-lg font-bold rounded-full shadow-[0_0_15px_rgba(8,145,178,0.8)] transition-all backdrop-blur-sm border border-cyan-400/30 flex items-center justify-center gap-3 whitespace-nowrap"
        >
          <span>📷 Snapshot</span>
        </button>
        <button 
          onClick={toggleRecording}
          className={`px-8 py-3 text-white text-lg font-bold rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all backdrop-blur-sm border border-red-400/30 flex items-center justify-center gap-3 whitespace-nowrap ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-600/90 hover:bg-red-500'}`}
        >
          <span>{isRecording ? '⏹ Stop Recording' : '🔴 Record Video'}</span>
        </button>
      </div>

      {/* Hidden Videos for Compositing */}
      <video id="n" className="opacity-0 pointer-events-none absolute w-[1px] h-[1px] -left-[9999px]" src="/assets/naruto.mp4" muted autoPlay loop playsInline></video>
      <video id="s" className="opacity-0 pointer-events-none absolute w-[1px] h-[1px] -left-[9999px]" src="/assets/sasuke.mp4" muted autoPlay loop playsInline></video>
      <video id="f" className="opacity-0 pointer-events-none absolute w-[1px] h-[1px] -left-[9999px]" src="/assets/fireball.mp4" muted autoPlay loop playsInline></video>
    </div>
  );
}
