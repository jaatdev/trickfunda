'use client';

import { useEffect, useRef } from 'react';

export function BlueprintBackground() {
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

    const shapes: any[] = [];
    
    // Create 3D wireframe cubes
    for(let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 40 + 20,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        speedZ: (Math.random() - 0.5) * 0.02,
        vertices: [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ],
        edges: [
          [0,1], [1,2], [2,3], [3,0],
          [4,5], [5,6], [6,7], [7,4],
          [0,4], [1,5], [2,6], [3,7]
        ]
      });
    }

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'; // Blue-500 very faint
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const project = (x: number, y: number, z: number, size: number) => {
      const fov = 300;
      const distance = 400;
      const scale = fov / (distance + z);
      return {
        x: x * scale * size,
        y: y * scale * size
      };
    };

    const rotateX = (v: number[], angle: number) => {
      const y = v[1] * Math.cos(angle) - v[2] * Math.sin(angle);
      const z = v[1] * Math.sin(angle) + v[2] * Math.cos(angle);
      return [v[0], y, z];
    };

    const rotateY = (v: number[], angle: number) => {
      const x = v[0] * Math.cos(angle) + v[2] * Math.sin(angle);
      const z = -v[0] * Math.sin(angle) + v[2] * Math.cos(angle);
      return [x, v[1], z];
    };

    const rotateZ = (v: number[], angle: number) => {
      const x = v[0] * Math.cos(angle) - v[1] * Math.sin(angle);
      const y = v[0] * Math.sin(angle) + v[1] * Math.cos(angle);
      return [x, y, v[2]];
    };

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawGrid();

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)'; // Blue-400
      ctx.lineWidth = 1.5;

      shapes.forEach(shape => {
        shape.rotX += shape.speedX;
        shape.rotY += shape.speedY;
        shape.rotZ += shape.speedZ;

        // Move across screen slowly
        shape.x += Math.sin(shape.rotY) * 0.5;
        shape.y += Math.cos(shape.rotX) * 0.5;

        // Wrap around
        if (shape.x > width + 100) shape.x = -100;
        if (shape.x < -100) shape.x = width + 100;
        if (shape.y > height + 100) shape.y = -100;
        if (shape.y < -100) shape.y = height + 100;

        const rotatedVertices = shape.vertices.map((v: number[]) => {
          let rot = rotateX(v, shape.rotX);
          rot = rotateY(rot, shape.rotY);
          rot = rotateZ(rot, shape.rotZ);
          return rot;
        });

        shape.edges.forEach((edge: number[]) => {
          const v1 = rotatedVertices[edge[0]];
          const v2 = rotatedVertices[edge[1]];

          const p1 = project(v1[0], v1[1], v1[2], shape.size);
          const p2 = project(v2[0], v2[1], v2[2], shape.size);

          ctx.beginPath();
          ctx.moveTo(shape.x + p1.x, shape.y + p1.y);
          ctx.lineTo(shape.x + p2.x, shape.y + p2.y);
          ctx.stroke();
        });
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
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#001021]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#001021_100%)] opacity-80" />
    </div>
  );
}
