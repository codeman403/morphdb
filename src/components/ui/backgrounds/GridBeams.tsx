'use client';

import { useEffect, useRef } from 'react';

export default function GridBeams() {
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

    // Grid config
    const gridSize = 40;
    const beams: { x: number; y: number; dir: 'h' | 'v'; length: number; speed: number; opacity: number }[] = [];
    const maxBeams = 7;

    // Create a new beam
    const createBeam = () => {
      const isHorizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
      const y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
      
      beams.push({
        x,
        y,
        dir: isHorizontal ? 'h' : 'v',
        length: Math.random() * 50 + 20,
        speed: Math.random() * 0.5 + 0.2,
        opacity: 0
      });
    };

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (very subtle)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Manage Beams
      if (beams.length < maxBeams && Math.random() < 0.02) {
        createBeam();
      }

      for (let i = beams.length - 1; i >= 0; i--) {
        const beam = beams[i];
        
        // Move
        if (beam.dir === 'h') beam.x += beam.speed;
        else beam.y += beam.speed;

        // Fade in/out logic
        if (beam.opacity < 0.8 && beam.x < canvas.width && beam.y < canvas.height) {
             beam.opacity += 0.02;
        } 
        
        // Remove if off screen
        if (beam.x > canvas.width || beam.y > canvas.height) {
          beams.splice(i, 1);
          continue;
        }

        // Draw Beam
        const gradient = ctx.createLinearGradient(
          beam.dir === 'h' ? beam.x - beam.length : beam.x,
          beam.dir === 'v' ? beam.y - beam.length : beam.y,
          beam.x,
          beam.y
        );
        
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${beam.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(56, 189, 248, ${beam.opacity})`); // Cyan head

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';

        ctx.beginPath();
        if (beam.dir === 'h') {
          ctx.moveTo(beam.x - beam.length, beam.y);
          ctx.lineTo(beam.x, beam.y);
        } else {
          ctx.moveTo(beam.x, beam.y - beam.length);
          ctx.lineTo(beam.x, beam.y);
        }
        ctx.stroke();
        
        ctx.shadowBlur = 0; // Reset shadow
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
