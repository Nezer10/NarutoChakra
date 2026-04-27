import { useState, useRef, useCallback } from 'react';

export function useRecording(canvasRef: React.RefObject<HTMLCanvasElement | null>, audioStream: MediaStream | null) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(() => {
        if (!canvasRef.current) return;

        // Extract video stream from canvas at 30 FPS
        const canvasStream = canvasRef.current.captureStream(30);
        
        // Merge audio stream if available
        const tracks = [...canvasStream.getVideoTracks()];
        if (audioStream) {
            tracks.push(...audioStream.getAudioTracks());
        }

        const mergedStream = new MediaStream(tracks);

        const options = { mimeType: 'video/webm; codecs=vp9' };
        let recorder: MediaRecorder;
        
        try {
            recorder = new MediaRecorder(mergedStream, options);
        } catch (e) {
            // Fallback for browsers that don't support VP9
            recorder = new MediaRecorder(mergedStream);
        }

        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `shinobi-jutsu-${new Date().getTime()}.webm`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        };

        recorder.start();
        setIsRecording(true);
    }, [canvasRef, audioStream]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    const toggleRecording = useCallback(() => {
        if (isRecording) stopRecording();
        else startRecording();
    }, [isRecording, startRecording, stopRecording]);

    return { isRecording, toggleRecording };
}
