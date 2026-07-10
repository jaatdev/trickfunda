'use client';

import { useEffect, useRef } from 'react';

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; radius: number; vx: number; vy: number; brightness: number; phase: number }[] = [];
    const numStars = Math.floor((width * height) / 3000);

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        brightness: Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.02;
      ctx.fillStyle = '#020617'; // Deep space slate
      ctx.fillRect(0, 0, width, height);

      stars.forEach(star => {
        // Move stars slowly
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle effect
        const currentBrightness = (Math.sin(time + star.phase) + 1) / 2 * star.brightness;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        // Color based on brightness - gold/amber hints
        if (Math.random() > 0.95) {
          ctx.fillStyle = `rgba(251, 191, 36, ${currentBrightness})`; // Amber
        } else if (Math.random() > 0.9) {
          ctx.fillStyle = `rgba(147, 197, 253, ${currentBrightness})`; // Blue
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`; // White
        }
        
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen opacity-80" />
      
      {/* Massive Cosmic Nebulas */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber-900/10 rounded-full blur-[150px] mix-blend-screen animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[200px] mix-blend-screen" />
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-rose-900/5 rounded-full blur-[150px] mix-blend-screen" />
    </div>
  );
}
