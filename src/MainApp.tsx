import { useRef } from 'react';
import { useMediaPipe } from './hooks/useMediaPipe';
import { useAudioSynthesis } from './hooks/useAudioSynthesis';
import { useRecording } from './hooks/useRecording';
import { Camera, Video, Square } from 'lucide-react';

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
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex gap-8 items-center">
        {/* Snapshot Button */}
        <div className="group relative flex flex-col items-center">
          <button 
            onClick={takeSnapshot}
            className="w-16 h-16 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-[0_10px_20px_rgba(8,145,178,0.6)] transition-all backdrop-blur-sm border border-cyan-400/50 flex items-center justify-center transform hover:-translate-y-2 hover:shadow-[0_15px_25px_rgba(8,145,178,0.8)] active:translate-y-0"
          >
            <Camera size={28} strokeWidth={2.5} />
          </button>
          <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-cyan-400 text-sm font-bold px-3 py-1 rounded-full border border-cyan-500/30 whitespace-nowrap">
            Snapshot
          </span>
        </div>

        {/* Recording Button */}
        <div className="group relative flex flex-col items-center">
          <button 
            onClick={toggleRecording}
            className={`w-20 h-20 text-white rounded-full transition-all backdrop-blur-sm border-2 flex items-center justify-center transform hover:-translate-y-2 ${
              isRecording 
                ? 'bg-red-500 border-red-300 shadow-[0_0_30px_rgba(239,68,68,1)] animate-[pulse_1s_ease-in-out_infinite]' 
                : 'bg-red-600 hover:bg-red-500 border-red-400/50 shadow-[0_10px_20px_rgba(220,38,38,0.6)] hover:shadow-[0_15px_25px_rgba(220,38,38,0.8)] active:translate-y-0'
            }`}
          >
            {isRecording ? <Square size={32} fill="currentColor" /> : <Video size={36} strokeWidth={2.5} />}
          </button>
          <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-red-400 text-sm font-bold px-3 py-1 rounded-full border border-red-500/30 whitespace-nowrap">
            {isRecording ? 'Stop Recording' : 'Record Jutsu'}
          </span>
        </div>
      </div>

      {/* Hidden Videos for Compositing */}
      <video id="n" className="opacity-0 pointer-events-none absolute w-[1px] h-[1px] -left-[9999px]" src="/assets/naruto.mp4" muted autoPlay loop playsInline></video>
      <video id="s" className="opacity-0 pointer-events-none absolute w-[1px] h-[1px] -left-[9999px]" src="/assets/sasuke.mp4" muted autoPlay loop playsInline></video>
      <video id="f" className="opacity-0 pointer-events-none absolute w-[1px] h-[1px] -left-[9999px]" src="/assets/fireball.mp4" muted autoPlay loop playsInline></video>
    </div>
  );
}
