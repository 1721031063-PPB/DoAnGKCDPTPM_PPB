"use client";

import { useEffect, useRef } from "react";

const RAIN_DENSITY = 120;
const RAIN_COLOR = "rgba(148, 197, 255, 0.8)";
const CLEAR_GLOW_COLOR = "rgba(251, 191, 36, 0.16)";
const CLOUD_COLOR = "rgba(148, 163, 184, 0.18)";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

export default function WeatherAtmosphere({ condition }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const raindropsRef = useRef([]);
  const lastLightningRef = useRef(0);
  const flashOpacityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth * 2);
    let height = (canvas.height = window.innerHeight * 2);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const handleResize = () => {
      width = (canvas.width = window.innerWidth * 2);
      height = (canvas.height = window.innerHeight * 2);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      initScene();
    };

    window.addEventListener("resize", handleResize);

    function initRain() {
      raindropsRef.current = [];
      for (let i = 0; i < RAIN_DENSITY; i++) {
        raindropsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          len: random(20, 45),
          speed: random(14, 26),
          opacity: random(0.25, 0.9)
        });
      }
    }

    function initScene() {
      if (condition === "rain" || condition === "drizzle" || condition === "thunderstorm") {
        initRain();
      } else {
        raindropsRef.current = [];
      }
    }

    initScene();

    function drawRain() {
      const drops = raindropsRef.current;
      ctx.strokeStyle = RAIN_COLOR;
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 2, d.y + d.len);
        ctx.stroke();

        d.x += 1;
        d.y += d.speed;

        if (d.y > height) {
          d.y = -20;
          d.x = Math.random() * width;
        }
      }

      ctx.globalAlpha = 1;
    }

    function drawThunder() {
      const now = performance.now();
      const interval = random(4000, 9000);

      if (now - lastLightningRef.current > interval) {
        lastLightningRef.current = now;
        flashOpacityRef.current = random(0.4, 0.9);
      }

      if (flashOpacityRef.current > 0.01) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacityRef.current})`;
        ctx.fillRect(0, 0, width, height);
        flashOpacityRef.current *= 0.85;
      }
    }

    function drawClear() {
      const gradient = ctx.createRadialGradient(
        width * 0.75,
        height * 0.1,
        0,
        width * 0.75,
        height * 0.1,
        width * 0.5
      );
      gradient.addColorStop(0, CLEAR_GLOW_COLOR);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function drawClouds() {
      const layers = 3;
      for (let i = 0; i < layers; i++) {
        const offsetY = height * (0.12 + i * 0.1);
        const gradient = ctx.createLinearGradient(0, offsetY, 0, offsetY + 220);
        gradient.addColorStop(0, CLOUD_COLOR);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(
          width * (0.2 + i * 0.22),
          offsetY,
          width * 0.3,
          120,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      if (condition === "clear") {
        drawClear();
      } else if (condition === "clouds" || condition === "mist") {
        drawClouds();
      } else if (
        condition === "rain" ||
        condition === "drizzle" ||
        condition === "thunderstorm"
      ) {
        drawRain();
        if (condition === "thunderstorm") {
          drawThunder();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [condition]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none mix-blend-screen"
    />
  );
}
