/**
 * ATMOS — Hourly Chart Component
 * 24-hour temperature & precipitation probability chart
 * Author: Agrima Vijayvargiya
 */
'use client';

import { useEffect, useRef } from 'react';
import { getTodayHourly, toFahrenheit } from '@/lib/weatherUtils';

export default function HourlyChart({ data, unit, theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data?.hourly || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawChart = () => {
      const hourly = getTodayHourly(data.hourly);
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const W = rect.width;
      const H = rect.height;
      const pad = { top: 20, right: 20, bottom: 50, left: 48 };
      const chartW = W - pad.left - pad.right;
      const chartH = H - pad.top - pad.bottom;
      const n = hourly.temps.length;

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? '#CBD5E1' : '#475569';
      const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

      ctx.clearRect(0, 0, W, H);

      // Compute ranges
      const temps = unit === 'F' ? hourly.temps.map(toFahrenheit) : hourly.temps;
      const minT = Math.min(...temps) - 2;
      const maxT = Math.max(...temps) + 2;
      const tempRange = maxT - minT || 1;

      const precips = hourly.precipitation;
      const maxP = Math.max(...precips, 20);

      const xScale = (i) => pad.left + (i / (n - 1)) * chartW;
      const yScaleT = (t) => pad.top + chartH - ((t - minT) / tempRange) * chartH;
      const yScaleP = (p) => pad.top + chartH - (p / maxP) * chartH;

      // Draw grid lines
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + chartW, y);
        ctx.stroke();
      }

      // Precipitation bars
      const barW = (chartW / n) * 0.6;
      precips.forEach((p, i) => {
        if (p > 0) {
          const x = xScale(i) - barW / 2;
          const bH = (p / maxP) * chartH;
          ctx.fillStyle = isDark ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.3)';
          ctx.beginPath();
          ctx.roundRect(x, yScaleP(p), barW, bH, 3);
          ctx.fill();
        }
      });

      // Temp gradient area
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
      if (isDark) {
        grad.addColorStop(0, 'rgba(139,92,246,0.5)');
        grad.addColorStop(0.5, 'rgba(56,189,248,0.3)');
        grad.addColorStop(1, 'rgba(56,189,248,0)');
      } else {
        grad.addColorStop(0, 'rgba(139,92,246,0.35)');
        grad.addColorStop(0.5, 'rgba(56,189,248,0.2)');
        grad.addColorStop(1, 'rgba(56,189,248,0)');
      }

      ctx.beginPath();
      ctx.moveTo(xScale(0), yScaleT(temps[0]));
      for (let i = 1; i < n; i++) {
        const x0 = xScale(i - 1), x1 = xScale(i);
        const y0 = yScaleT(temps[i - 1]), y1 = yScaleT(temps[i]);
        const cpX = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1);
      }
      ctx.lineTo(xScale(n - 1), pad.top + chartH);
      ctx.lineTo(xScale(0), pad.top + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Temp line
      ctx.beginPath();
      ctx.moveTo(xScale(0), yScaleT(temps[0]));
      for (let i = 1; i < n; i++) {
        const x0 = xScale(i - 1), x1 = xScale(i);
        const y0 = yScaleT(temps[i - 1]), y1 = yScaleT(temps[i]);
        const cpX = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpX, y0, cpX, y1, x1, y1);
      }
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dots at every 3 hours
      temps.forEach((t, i) => {
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(xScale(i), yScaleT(t), 4, 0, Math.PI * 2);
          ctx.fillStyle = '#8B5CF6';
          ctx.fill();
          ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // X-axis labels (every 3 hours)
      ctx.fillStyle = textColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      hourly.times.forEach((time, i) => {
        if (i % 3 === 0) {
          const h = new Date(time).getHours();
          const label = h === 0 ? '12am' : h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`;
          ctx.fillText(label, xScale(i), H - 10);
        }
      });

      // Y-axis labels
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const t = minT + (tempRange / 4) * (4 - i);
        const label = unit === 'F' ? `${Math.round(t)}°F` : `${Math.round(t)}°C`;
        ctx.fillText(label, pad.left - 6, pad.top + (chartH / 4) * i + 4);
      }

      // Legend
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(pad.left, 5, 16, 3);
      ctx.fillStyle = textColor;
      ctx.fillText('Temperature', pad.left + 20, 12);
      ctx.fillStyle = isDark ? 'rgba(56,189,248,0.5)' : 'rgba(56,189,248,0.5)';
      ctx.fillRect(pad.left + 120, 5, 16, 3);
      ctx.fillStyle = textColor;
      ctx.fillText('Precipitation %', pad.left + 140, 12);
    };

    // Draw initially
    drawChart();

    // Listen for resize events
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, [data, unit, theme]);

  return (
    <div className="hourly-chart-card glass-card" aria-label="Hourly temperature chart">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <h2>24-Hour Forecast</h2>
      </div>
      <div className="chart-wrapper">
        <canvas ref={canvasRef} className="hourly-canvas" aria-label="Temperature and precipitation chart"/>
      </div>
    </div>
  );
}
