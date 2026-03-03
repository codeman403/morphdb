'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function GridBeams() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const beamsRef = useRef<{ x: number; y: number; dir: 'h' | 'v'; length: number; speed: number; opacity: number }[]>([]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer to pause animation when off-screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Page visibility API - pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Create beam function
  const createBeam = useCallback((canvasWidth: number, canvasHeight: number, gridSize: number) => {
    const isHorizontal = Math.random() > 0.5;
    const x = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
    const y = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;
    
    beamsRef.current.push({
      x,
      y,
      dir: isHorizontal ? 'h' : 'v',
      length: Math.random() * 50 + 20,
      speed: Math.random() * 0.5 + 0.2,
      opacity: 0
    });
  }, []);

  // Main animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    // Skip animation if mobile, reduced motion preferred, or not visible
    if (!canvas || isMobile || prefersReducedMotion || !isVisible) {
      // Cancel any existing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid config
    const gridSize = 40;
    const maxBeams = 7;
    const beams = beamsRef.current;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Draw Grid (very subtle)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Manage Beams
      if (beams.length < maxBeams && Math.random() < 0.02) {
        createBeam(width, height, gridSize);
      }

      for (let i = beams.length - 1; i >= 0; i--) {
        const beam = beams[i];
        
        // Move
        if (beam.dir === 'h') beam.x += beam.speed;
        else beam.y += beam.speed;

        // Fade in/out logic
        if (beam.opacity < 0.8 && beam.x < width && beam.y < height) {
          beam.opacity += 0.02;
        } 
        
        // Remove if off screen
        if (beam.x > width || beam.y > height) {
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
        gradient.addColorStop(1, `rgba(56, 189, 248, ${beam.opacity})`);

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
        
        ctx.shadowBlur = 0;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isMobile, prefersReducedMotion, isVisible, createBeam]);

  // If reduced motion is preferred, show a static subtle grid instead
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}
