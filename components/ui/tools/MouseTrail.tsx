'use client';

import { useEffect, useRef } from 'react';

export function MouseTrail() {
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

    const points: { x: number; y: number; age: number }[] = [];
    const maxAge = 40; 
    let mouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      points.push({ x: mouse.x, y: mouse.y, age: 0 });
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrame: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw the trail
      if (points.length > 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

        // Gradient for the stroke
        const gradient = ctx.createLinearGradient(
          points[0].x, points[0].y, 
          points[points.length - 1].x, points[points.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0)'); // violet-500 transparent
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)'); // blue-500
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0)'); // pink-500 transparent

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.filter = 'blur(4px)';
        ctx.stroke();
      }

      // Update ages and remove old points
      for (let i = 0; i < points.length; i++) {
        points[i].age++;
      }
      while (points.length > 0 && points[0].age > maxAge) {
        points.shift();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 mix-blend-screen opacity-70"
    />
  );
}
