import { useEffect, useRef, useState } from 'react';

export function useAudioSynthesis(jutsu: string) {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const destNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (!audioCtxRef.current && jutsu) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainNodeRef.current = audioCtxRef.current.createGain();
            destNodeRef.current = audioCtxRef.current.createMediaStreamDestination();
            
            // Connect to speakers AND to the recording destination
            gainNodeRef.current.connect(audioCtxRef.current.destination);
            gainNodeRef.current.connect(destNodeRef.current);
            
            setAudioStream(destNodeRef.current.stream);
        }

        const ctx = audioCtxRef.current;
        const gain = gainNodeRef.current;
        
        if (!ctx || !gain) return;

        // Stop previous noise
        if (noiseNodeRef.current) {
            try { noiseNodeRef.current.stop(); } catch(e) {}
            noiseNodeRef.current.disconnect();
            noiseNodeRef.current = null;
        }

        if (!jutsu) return;

        // Create white noise buffer
        const bufferSize = ctx.sampleRate * 2; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        
        if (jutsu.includes('Fireball')) {
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Deep rumble
            gain.gain.value = 0.8;
        } else if (jutsu.includes('Chidori')) {
            filter.type = 'highpass';
            filter.frequency.value = 5000; // High pitch crackle
            
            const lfo = ctx.createOscillator();
            lfo.type = 'sawtooth';
            lfo.frequency.value = 50;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 2000;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start();
            
            gain.gain.value = 0.3;
        } else if (jutsu.includes('Rasengan')) {
            filter.type = 'bandpass';
            filter.frequency.value = 800; // Whirling wind
            gain.gain.value = 0.5;
        }

        noiseSource.connect(filter);
        filter.connect(gain);
        noiseSource.start();
        noiseNodeRef.current = noiseSource;

    }, [jutsu]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(console.error);
                audioCtxRef.current = null;
            }
        };
    }, []);

    return audioStream;
}
