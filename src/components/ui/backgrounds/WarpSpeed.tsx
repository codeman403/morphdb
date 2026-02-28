'use client';

import { useEffect, useRef } from 'react';

export default function WarpSpeed() {
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

    // Star config
    const stars: { x: number; y: number; z: number; o: number }[] = [];
    const starCount = 400;
    const speed = 2; // Warp speed factor

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width * 2,
        y: (Math.random() - 0.5) * canvas.height * 2,
        z: Math.random() * canvas.width,
        o: Math.random()
      });
    }

    let animationFrameId: number;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        
        // Move star towards screen (decrease z)
        star.z -= speed;

        // Reset if passed screen
        if (star.z <= 0) {
           star.z = canvas.width;
           star.x = (Math.random() - 0.5) * canvas.width * 2;
           star.y = (Math.random() - 0.5) * canvas.height * 2;
        }

        // Project 3D to 2D
        const x = (star.x / star.z) * 100 + cx;
        const y = (star.y / star.z) * 100 + cy;

        // Calculate size and opacity based on distance (z)
        const size = (1 - star.z / canvas.width) * 3;
        const opacity = (1 - star.z / canvas.width);

        if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Warp streak
          const prevX = (star.x / (star.z + speed * 2)) * 100 + cx;
          const prevY = (star.y / (star.z + speed * 2)) * 100 + cy;
          
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.5})`;
          ctx.lineWidth = size / 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(prevX, prevY);
          ctx.stroke();
        }
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
