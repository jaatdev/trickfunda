'use client';

import { useEffect, useRef } from 'react';

export function GoldenDustBackground() {
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

    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number }[] = [];
    const numParticles = 120;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 0.5 + 0.1), // Drift up slowly
        speedX: (Math.random() - 0.5) * 0.4, // Slight horizontal drift
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Reset if goes off screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        // Mouse interaction (gentle push)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          p.x -= (dx / dist) * 1.5;
          p.y -= (dy / dist) * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 211, 77, ${p.opacity})`; // Golden amber
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(252, 211, 77, 0.8)';
        ctx.fill();
        // Reset shadow for performance on next iterations if needed
        ctx.shadowBlur = 0; 
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Royal Navy Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1128] to-[#040814]" />
      
      {/* Magical glowing atmospheric radial blooms */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[150px] mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/15 rounded-full blur-[120px] mix-blend-screen" />

      {/* Grid pattern, like parchment overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-screen"
      />
    </div>
  );
}
