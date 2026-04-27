import { useEffect, useState, RefObject } from 'react';

declare const Hands: any;
declare const Camera: any;
declare const drawConnectors: any;
declare const drawLandmarks: any;
declare const HAND_CONNECTIONS: any;

interface Point { x: number; y: number; z?: number; }

interface MediaPipeResults {
    multiHandLandmarks?: Point[][];
    multiHandedness?: { label: string }[];
}

function isFingerOpen(pts: Point[], tipIdx: number, pipIdx: number, wrist: Point) {
    return Math.hypot(pts[tipIdx].x - wrist.x, pts[tipIdx].y - wrist.y) > 
           Math.hypot(pts[pipIdx].x - wrist.x, pts[pipIdx].y - wrist.y);
}

function checkHandState(pts: Point[]) {
    const wrist = pts[0];
    const indexOpen = isFingerOpen(pts, 8, 6, wrist);
    const middleOpen = isFingerOpen(pts, 12, 10, wrist);
    const ringOpen = isFingerOpen(pts, 16, 14, wrist);
    const pinkyOpen = isFingerOpen(pts, 20, 18, wrist);
    
    const openCount = [indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;
    
    return {
        isOpen: openCount >= 3,
        isTigerSealHalf: indexOpen && middleOpen && !ringOpen && !pinkyOpen,
        wrist,
        indexTip: pts[8],
        middleTip: pts[12],
        knk: pts[9]
    };
}

export function useMediaPipe(videoRef: RefObject<HTMLVideoElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>) {
    const [jutsu, setJutsu] = useState<string>('');

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const vElement = videoRef.current;
        const cElement = canvasRef.current;
        const ctx = cElement.getContext('2d')!;
        
        const nVid = document.getElementById('n') as HTMLVideoElement;
        const sVid = document.getElementById('s') as HTMLVideoElement;
        const fVid = document.getElementById('f') as HTMLVideoElement;
        
        let pwr = [0, 0];
        let wasOpen = [false, false];
        let currentJutsu = '';

        function onResults(res: MediaPipeResults) {
            cElement.width = vElement.videoWidth;
            cElement.height = vElement.videoHeight;
            ctx.save();
            ctx.clearRect(0, 0, cElement.width, cElement.height);

            // Draw Webcam Feed
            ctx.drawImage(vElement, 0, 0, cElement.width, cElement.height);

            let activeJutsu = '';
            let handsData: any[] = [];

            if (res.multiHandLandmarks && res.multiHandedness) {
                res.multiHandLandmarks.forEach((pts: Point[], i: number) => {
                    const isR = res.multiHandedness![i].label === 'Right';
                    const idx = isR ? 1 : 0;
                    
                    ctx.save();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#00fbff';
                    drawConnectors(ctx, pts, HAND_CONNECTIONS, {color: '#00d4ff', lineWidth: 3});
                    drawLandmarks(ctx, pts, {color: '#ffffff', lineWidth: 1, radius: 2});
                    ctx.restore();

                    const state = checkHandState(pts);
                    handsData.push({ ...state, isR, idx });

                    if (state.isOpen) {
                        pwr[idx] = Math.min(1, pwr[idx] + 0.05);
                        if (!wasOpen[idx]) {
                            const vid = isR ? sVid : nVid;
                            if (vid) {
                                vid.currentTime = 0;
                                vid.play().catch(e => console.error(e));
                            }
                        }
                    } else {
                        pwr[idx] = Math.max(0, pwr[idx] - 0.15);
                    }
                    wasOpen[idx] = state.isOpen;
                });

                const tigerHand = handsData.find(h => h.isTigerSealHalf);
                if (tigerHand) {
                    activeJutsu = 'Fireball Jutsu';
                    pwr[tigerHand.idx] = 1;
                }

                if (!activeJutsu) {
                    if (handsData.find(h => h.idx === 0 && h.isOpen && pwr[0] > 0.8)) activeJutsu = 'Rasengan';
                    if (handsData.find(h => h.idx === 1 && h.isOpen && pwr[1] > 0.8)) activeJutsu = 'Chidori';
                    if (pwr[0] > 0.8 && pwr[1] > 0.8) activeJutsu = 'Twin Rasen-Chidori';
                }

                // Render Videos to Canvas
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                
                if (activeJutsu === 'Fireball Jutsu' && tigerHand && fVid) {
                    const cx = (tigerHand.indexTip.x + tigerHand.middleTip.x) / 2 * cElement.width;
                    const cy = Math.min(tigerHand.indexTip.y, tigerHand.middleTip.y) * cElement.height;
                    
                    const vw = 400; // Fireball width
                    const vh = vw * (fVid.videoHeight / fVid.videoWidth);
                    ctx.globalAlpha = 1;
                    ctx.drawImage(fVid, cx - vw / 2, cy - vh / 2, vw, vh);
                } else if (activeJutsu) {
                    handsData.forEach(h => {
                        if (h.isOpen && pwr[h.idx] > 0.01) {
                            const cx = (h.wrist.x + h.knk.x) / 2 * cElement.width;
                            const cy = h.middleTip.y * cElement.height;
                            
                            const vid = h.idx === 0 ? nVid : sVid;
                            if (vid) {
                                const vw = h.idx === 0 ? 1000 : 1600; // Rasengan vs Chidori sizing
                                const vh = vw * (vid.videoHeight / vid.videoWidth);
                                ctx.globalAlpha = pwr[h.idx];
                                ctx.drawImage(vid, cx - vw / 2, cy - vh / 2, vw, vh);
                            }
                        }
                    });
                }
                ctx.restore();
            } else {
                pwr = [Math.max(0, pwr[0] - 0.15), Math.max(0, pwr[1] - 0.15)];
                wasOpen = [false, false];
            }

            if (currentJutsu !== activeJutsu) {
                currentJutsu = activeJutsu;
                setJutsu(activeJutsu);
            }
            ctx.restore();
        }

        const hands = new Hands({
            locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
        });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.65, minTrackingConfidence: 0.65 });
        hands.onResults(onResults);

        const cam = new Camera(vElement, {
            onFrame: async () => { await hands.send({ image: vElement }); },
            width: 1280, height: 720
        });
        cam.start();

        return () => {
            cam.stop();
            hands.close();
        };
    }, []);

    return { jutsu };
}
