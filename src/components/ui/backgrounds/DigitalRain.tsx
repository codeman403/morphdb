'use client';

import { useEffect, useRef } from 'react';

export default function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start above canvas
    }

    const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Fade effect (slate-950 base)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981'; // Emerald-500
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * 20;
        const y = drops[i] * 20;
        
        // Randomly brighter character
        if (Math.random() > 0.95) {
             ctx.fillStyle = '#22d3ee'; // Cyan-400
        } else {
             ctx.fillStyle = '#059669'; // Emerald-600
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
}
