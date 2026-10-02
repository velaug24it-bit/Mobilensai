import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface HackathonDemoVideoProps {
  onClose: () => void;
  onFinished: () => void;
}

/* ─── Scene definitions ──────────────────────────────────────────────── */
const SCENES = [
  {
    id: 0, duration: 4500,
    title: '05:45 AM — Home', subtitle: 'Tirunelveli, Tamil Nadu',
    caption: 'A student commuter wakes before dawn. The journey to Francis Xavier Engineering College is 38 km away. Today MobiLens will change everything.',
    accentColor: '#6366f1', scene: 'home',
  },
  {
    id: 1, duration: 4000,
    title: '06:10 AM — Walking', subtitle: 'Vannarpettai Street → NH-138',
    caption: 'A 400m walk carrying a heavy bag in rising heat. No shade. No shelter. Friction begins accumulating.',
    accentColor: '#f59e0b', scene: 'walk',
  },
  {
    id: 2, duration: 4500,
    title: '06:24 AM — Bus Stop', subtitle: 'Vagaikulam NH-138 Junction',
    caption: 'The bus is 16 minutes late. Standing on an unshaded roadside. Heat stress: MODERATE. Friction score: +18 points.',
    accentColor: '#ef4444', scene: 'busstop',
  },
  {
    id: 3, duration: 4000,
    title: '06:40 AM — Bus 12A', subtitle: 'Route: Thoothukudi → Tirunelveli',
    caption: 'Bus arrives. Overcrowded. No AC. The 22 km ride costs ₹25. Journey is moving — but burden keeps rising.',
    accentColor: '#10b981', scene: 'bus',
  },
  {
    id: 4, duration: 4200,
    title: '07:35 AM — Transfer Risk', subtitle: 'Tirunelveli Junction • Zone 17',
    caption: 'Missed the connecting route. Buffer: -2 min. MobiLens flags HIGH TRANSFER RISK. Friction spikes: 72 → 86/100.',
    accentColor: '#ef4444', scene: 'risk',
  },
  {
    id: 5, duration: 4000,
    title: '07:52 AM — AI Recovery', subtitle: 'MobiLens Intervention Engine',
    caption: 'MobiLens computes 4 alternatives in real-time. EV Feeder via covered route saves 15 minutes and drops friction to 44.',
    accentColor: '#06b6d4', scene: 'ai',
  },
  {
    id: 6, duration: 5000,
    title: '08:05 AM — Arrival', subtitle: 'Francis Xavier Engineering College',
    caption: '15 minutes reclaimed. Friction: 46/100. 4,210 citizens can reclaim this time — every single day.',
    accentColor: '#22c55e', scene: 'arrival',
  },
];

const TOTAL_DURATION = SCENES.reduce((a, s) => a + s.duration, 0);

/* ─── Canvas renderers ───────────────────────────────────────────────── */

function drawHuman(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  phase: number, color: string
) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, size / 20); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - size * 0.85, size * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - size * 0.7); ctx.lineTo(x, y - size * 0.3); ctx.stroke();
  const swing = Math.sin(phase) * 0.3;
  ctx.beginPath(); ctx.moveTo(x, y - size * 0.6); ctx.lineTo(x - size * 0.28, y - size * 0.38 + swing * size * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - size * 0.6); ctx.lineTo(x + size * 0.28, y - size * 0.38 - swing * size * 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - size * 0.3); ctx.lineTo(x - size * 0.22 + Math.sin(phase) * size * 0.18, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - size * 0.3); ctx.lineTo(x + size * 0.22 - Math.sin(phase) * size * 0.18, y); ctx.stroke();
}

function renderHome(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, W, H);
  // Stars
  for (let i = 0; i < 90; i++) {
    const sx = (i * 137.5) % W, sy = (i * 89.3) % (H * 0.55);
    const p = 0.4 + 0.6 * Math.abs(Math.sin(t / 700 + i * 0.8));
    ctx.globalAlpha = p * 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(sx, sy, 0.8 + p * 0.7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Moon
  ctx.fillStyle = 'rgba(255,245,200,0.9)';
  ctx.beginPath(); ctx.arc(W * 0.82, H * 0.1, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#060714';
  ctx.beginPath(); ctx.arc(W * 0.82 + 9, H * 0.1, 19, 0, Math.PI * 2); ctx.fill();
  // Ground
  const gg = ctx.createLinearGradient(0, H * 0.66, 0, H);
  gg.addColorStop(0, '#0b0f1c'); gg.addColorStop(1, '#050810');
  ctx.fillStyle = gg; ctx.fillRect(0, H * 0.66, W, H * 0.34);
  // House
  const hx = W * 0.5, hy = H * 0.66;
  ctx.fillStyle = '#080c18'; ctx.fillRect(hx - 95, hy - 105, 190, 105);
  ctx.beginPath(); ctx.moveTo(hx - 115, hy - 105); ctx.lineTo(hx, hy - 172); ctx.lineTo(hx + 115, hy - 105);
  ctx.closePath(); ctx.fillStyle = '#060a12'; ctx.fill();
  // Window glow
  const wg = 0.7 + 0.3 * Math.sin(t / 550);
  ctx.shadowBlur = 22; ctx.shadowColor = `rgba(255,200,80,${wg})`;
  ctx.fillStyle = `rgba(255,195,80,${wg * 0.95})`;
  ctx.fillRect(hx - 58, hy - 85, 36, 36); ctx.fillRect(hx + 22, hy - 85, 36, 36);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#131b2d'; ctx.fillRect(hx - 19, hy - 52, 38, 52);
  ctx.fillStyle = 'rgba(255,195,80,0.12)'; ctx.fillRect(hx - 19, hy - 52, 38, 52);
  // Trees
  [0.14, 0.19, 0.76, 0.82].forEach((tx, i) => {
    const th = H * (0.13 + i * 0.02);
    ctx.fillStyle = '#07090f';
    ctx.beginPath(); ctx.moveTo(W * tx, H * 0.66 - th); ctx.lineTo(W * tx - 22, H * 0.66); ctx.lineTo(W * tx + 22, H * 0.66); ctx.closePath(); ctx.fill();
  });
  // Clock
  const a = Math.min(1, t / 900);
  ctx.globalAlpha = a;
  ctx.fillStyle = '#6366f1'; ctx.font = `bold ${Math.round(W * 0.05)}px monospace`; ctx.textAlign = 'center';
  ctx.fillText('05:45', W * 0.5, H * 0.38);
  ctx.fillStyle = '#94a3b8'; ctx.font = `${Math.round(W * 0.02)}px sans-serif`;
  ctx.fillText('⏰  MobiLens tracking active', W * 0.5, H * 0.46);
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

function renderWalk(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const sg = ctx.createLinearGradient(0, 0, 0, H * 0.62);
  sg.addColorStop(0, '#08040a'); sg.addColorStop(0.6, '#1c0c04'); sg.addColorStop(1, '#3a1a08');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.62);
  // Sunrise
  const sunRad = ctx.createRadialGradient(W * 0.88, H * 0.6, 0, W * 0.88, H * 0.6, W * 0.38);
  sunRad.addColorStop(0, 'rgba(255,140,20,0.45)'); sunRad.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = sunRad; ctx.fillRect(0, 0, W, H);
  // Road + sidewalk
  ctx.fillStyle = '#181818'; ctx.fillRect(0, H * 0.62, W, H * 0.38);
  ctx.fillStyle = '#202020'; ctx.fillRect(0, H * 0.62, W, H * 0.08);
  for (let i = 0; i < 8; i++) {
    const rx = ((i * W / 5) - (t / 18) % (W / 5));
    ctx.fillStyle = 'rgba(255,220,0,0.45)'; ctx.fillRect(rx, H * 0.74, W / 14, 3);
  }
  // Buildings
  [0.08, 0.28, 0.5, 0.7, 0.88].forEach((bx, i) => {
    const bh = H * (0.16 + (i % 3) * 0.05);
    ctx.fillStyle = `rgba(8,10,18,${0.75 + i * 0.04})`; ctx.fillRect(W * bx, H * 0.62 - bh, W * 0.18, bh);
    for (let wr = 0; wr < 4; wr++) for (let wc = 0; wc < 2; wc++) {
      ctx.fillStyle = Math.random() > 0.45 ? 'rgba(255,215,95,0.75)' : 'rgba(18,28,48,0.8)';
      ctx.fillRect(W * bx + 7 + wc * 19, H * 0.62 - bh + 8 + wr * 23, 11, 14);
    }
  });
  // Walking person
  const px = W * 0.14 + Math.sin(t / 210) * 2;
  drawHuman(ctx, px, H * 0.638, 42, t / 210, '#f59e0b');
  // Bag
  ctx.fillStyle = '#92400e'; ctx.beginPath(); ctx.roundRect(px + 14, H * 0.638 - 35, 14, 20, 3); ctx.fill();
  // Heat shimmer
  ctx.globalAlpha = 0.04 * Math.abs(Math.sin(t / 280));
  ctx.fillStyle = '#ff8800'; ctx.fillRect(0, H * 0.38, W, H * 0.24);
  ctx.globalAlpha = 1;
  // Badge
  const ba = Math.min(1, t / 700);
  ctx.globalAlpha = ba;
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.beginPath(); ctx.roundRect(W * 0.03, 12, W * 0.44, 56, 10); ctx.fill();
  ctx.fillStyle = '#f59e0b'; ctx.font = `bold ${Math.round(W * 0.026)}px sans-serif`; ctx.fillText('🌡  Heat: Rising', W * 0.06, 36);
  ctx.fillStyle = '#94a3b8'; ctx.font = `${Math.round(W * 0.018)}px sans-serif`; ctx.fillText('400m Walk • No Shelter', W * 0.06, 58);
  ctx.globalAlpha = 1;
}

function renderBusStop(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const sg = ctx.createLinearGradient(0, 0, 0, H * 0.64);
  sg.addColorStop(0, '#0e0300'); sg.addColorStop(1, '#3c1200');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.64);
  // Sun
  const pulse = 0.88 + 0.12 * Math.sin(t / 390);
  ctx.shadowBlur = 38 * pulse; ctx.shadowColor = 'rgba(255,175,0,0.65)';
  ctx.fillStyle = `rgba(255,195,45,${pulse})`;
  ctx.beginPath(); ctx.arc(W * 0.78, H * 0.17, 26 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Road
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, H * 0.64, W, H * 0.36);
  // Shelter poles (no roof)
  ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 5;
  [W * 0.54, W * 0.82].forEach(px => {
    ctx.beginPath(); ctx.moveTo(px, H * 0.44); ctx.lineTo(px, H * 0.64); ctx.stroke();
  });
  // Sign
  ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.roundRect(W * 0.54, H * 0.34, W * 0.28, H * 0.1, 6); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W * 0.023)}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('BUS STOP', W * 0.68, H * 0.41); ctx.textAlign = 'left';
  // Waiting people
  [W * 0.56, W * 0.61, W * 0.67].forEach((px, i) => drawHuman(ctx, px, H * 0.655, 30, 0, i === 0 ? '#f87171' : '#94a3b8'));
  // Heat waves
  for (let i = 0; i < 5; i++) {
    const wp = ((t / 1400 + i * 0.22) % 1);
    ctx.globalAlpha = (1 - wp) * 0.28;
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.1, H * (0.28 + i * 0.055) + Math.sin(t / 290 + i) * 5);
    ctx.quadraticCurveTo(W * 0.5, H * (0.26 + i * 0.055), W * 0.9, H * (0.28 + i * 0.055)); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Wait timer
  const waitMin = Math.max(0, 16 - Math.floor(t / 270));
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.beginPath(); ctx.roundRect(W * 0.04, H * 0.44, W * 0.4, H * 0.19, 14); ctx.fill();
  ctx.fillStyle = '#ef4444'; ctx.font = `bold ${Math.round(W * 0.055)}px monospace`; ctx.textAlign = 'center';
  ctx.fillText(`+${waitMin}m`, W * 0.24, H * 0.565);
  ctx.fillStyle = '#fca5a5'; ctx.font = `${Math.round(W * 0.019)}px sans-serif`;
  ctx.fillText('Bus Delay • Friction +18', W * 0.24, H * 0.613);
  ctx.textAlign = 'left';
}

function renderBus(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.fillStyle = '#0c1a0c'; ctx.fillRect(0, 0, W, H);
  // Scrolling road through window
  const scroll = -(t / 3) % W;
  ctx.fillStyle = '#161616'; ctx.fillRect(0, H * 0.08, W, H * 0.27);
  for (let i = -1; i < 5; i++) {
    const lx = scroll + i * W * 0.22;
    ctx.fillStyle = 'rgba(255,220,0,0.4)'; ctx.fillRect(lx, H * 0.18, W * 0.1, 3);
  }
  // Trees
  for (let i = 0; i < 7; i++) {
    const tx = (scroll + i * W * 0.17 + W * 0.08) % (W + 60) - 30;
    ctx.fillStyle = '#122012'; ctx.beginPath(); ctx.arc(tx, H * 0.08, 20, 0, Math.PI * 2); ctx.fill();
  }
  // Windshield frame
  ctx.strokeStyle = '#1e3a1e'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(W * 0.04, H * 0.05, W * 0.92, H * 0.3, 12); ctx.stroke();
  // Interior
  ctx.fillStyle = '#172217'; ctx.fillRect(0, H * 0.35, W, H * 0.65);
  // Seat rows
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const sx = W * 0.06 + col * W * 0.23, sy = H * 0.4 + row * H * 0.17;
      const occupied = (col + row) % 3 !== 2;
      ctx.fillStyle = occupied ? '#1d3a1d' : '#2a1a0a';
      ctx.beginPath(); ctx.roundRect(sx, sy, W * 0.19, H * 0.14, 8); ctx.fill();
      if (occupied) {
        ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.arc(sx + W * 0.095, sy + H * 0.045, H * 0.032, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  // Route bar
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, H * 0.35, W, H * 0.065);
  ctx.fillStyle = '#10b981'; ctx.font = `bold ${Math.round(W * 0.022)}px monospace`; ctx.textAlign = 'center';
  const km = Math.max(0, 22 - (t / 4000) * 22).toFixed(1);
  ctx.fillText(`BUS 12A  •  ${km} km remaining  •  ₹25  •  Overcrowded`, W * 0.5, H * 0.398);
  ctx.textAlign = 'left';
  // Vibration
  ctx.globalAlpha = 0.025; ctx.fillStyle = '#fff'; ctx.fillRect(Math.sin(t / 80) * 2, 0, W, H); ctx.globalAlpha = 1;
}

function renderRisk(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.fillStyle = '#0c0002'; ctx.fillRect(0, 0, W, H);
  const alertPulse = 0.5 + 0.5 * Math.abs(Math.sin(t / 480));
  const rg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.65);
  rg.addColorStop(0, `rgba(239,68,68,${alertPulse * 0.18})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  // Intersection
  ctx.fillStyle = '#181818'; ctx.fillRect(0, H * 0.5, W, H * 0.5); ctx.fillRect(W * 0.38, 0, W * 0.24, H);
  for (let i = 0; i < 7; i++) ctx.fillStyle = 'rgba(255,255,255,0.25)', ctx.fillRect(W * 0.38 + i * (W * 0.034), H * 0.5, W * 0.022, H * 0.2);
  // Bus moving
  const busX = W * 0.92 - (t / 4200) * W * 0.7;
  ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.roundRect(busX, H * 0.52, W * 0.2, H * 0.16, 7); ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath(); ctx.arc(busX + 9, H * 0.68, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(busX + W * 0.2 - 9, H * 0.68, 7, 0, Math.PI * 2); ctx.fill();
  // Pedestrian
  const personX = W * 0.5;
  drawHuman(ctx, personX, H * 0.525, 38, (t / 280) % (Math.PI * 2), '#fbbf24');
  // Danger arc
  const dd = Math.abs(busX - personX);
  if (dd < W * 0.42) {
    ctx.globalAlpha = Math.max(0, (1 - dd / (W * 0.42)) * alertPulse * 0.9);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(personX, H * 0.52, dd * 0.65, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Alert bar
  ctx.fillStyle = `rgba(185,28,28,${alertPulse * 0.95})`;
  ctx.beginPath(); ctx.roundRect(W * 0.04, H * 0.04, W * 0.92, H * 0.14, 14); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W * 0.032)}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('⚠  HIGH TRANSFER RISK  —  FRICTION 86/100', W * 0.5, H * 0.11);
  ctx.font = `${Math.round(W * 0.018)}px sans-serif`; ctx.fillStyle = '#fca5a5';
  ctx.fillText('Zone 17 • 23 Near-Miss Conflicts • TTC < 1.4 s', W * 0.5, H * 0.165);
  ctx.textAlign = 'left';
}

function renderAI(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.fillStyle = '#000d1c'; ctx.fillRect(0, 0, W, H);
  // Neural net
  const nodes: [number, number][] = [];
  for (let i = 0; i < 15; i++) nodes.push([W * 0.05 + (i % 5) * W * 0.22, H * 0.18 + Math.floor(i / 5) * H * 0.18]);
  nodes.forEach(([nx, ny], i) => {
    nodes.forEach(([nx2, ny2], j) => {
      if (j > i && Math.abs(i - j) <= 6) {
        const p = 0.06 + 0.25 * Math.abs(Math.sin(t / 580 + i * 0.5 + j * 0.3));
        ctx.globalAlpha = p; ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx2, ny2); ctx.stroke(); ctx.globalAlpha = 1;
      }
    });
    const p2 = 0.55 + 0.45 * Math.sin(t / 380 + i);
    ctx.fillStyle = `rgba(6,182,212,${p2})`; ctx.beginPath(); ctx.arc(nx, ny, 4 + p2 * 3, 0, Math.PI * 2); ctx.fill();
  });
  // Options
  const opts = [
    { label: 'A — Current', time: '68 min', friction: 86, risk: 'HIGH', color: '#ef4444' },
    { label: 'B — EV Feeder', time: '53 min', friction: 44, risk: 'LOW', color: '#10b981' },
    { label: 'C — Bypass', time: '56 min', friction: 51, risk: 'MOD', color: '#f59e0b' },
    { label: 'D — Walking+', time: '60 min', friction: 62, risk: 'LOW', color: '#6366f1' },
  ];
  opts.forEach((opt, i) => {
    const slideT = Math.max(0, Math.min(1, (t - i * 480) / 550));
    const cx = W * 0.04 + i * (W * 0.245), cy = H * 0.55 + (1 - slideT) * 65;
    ctx.globalAlpha = slideT;
    ctx.fillStyle = i === 0 ? 'rgba(28,8,8,0.92)' : 'rgba(4,18,32,0.92)';
    ctx.beginPath(); ctx.roundRect(cx, cy, W * 0.23, H * 0.34, 14); ctx.fill();
    ctx.strokeStyle = opt.color; ctx.lineWidth = i === 1 ? 3 : 1.5; ctx.stroke();
    if (i === 1) { ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(16,185,129,0.1)'; ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = opt.color; ctx.font = `bold ${Math.round(W * 0.02)}px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(opt.label, cx + W * 0.115, cy + H * 0.065);
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W * 0.036)}px monospace`;
    ctx.fillText(opt.time, cx + W * 0.115, cy + H * 0.155);
    ctx.fillStyle = '#94a3b8'; ctx.font = `${Math.round(W * 0.017)}px sans-serif`;
    ctx.fillText(`Friction: ${opt.friction}/100`, cx + W * 0.115, cy + H * 0.225);
    ctx.fillStyle = opt.color; ctx.fillText(`Risk: ${opt.risk}`, cx + W * 0.115, cy + H * 0.29);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  });
  // AI label
  const dots = '.'.repeat(1 + Math.floor(t / 460) % 3);
  ctx.fillStyle = '#06b6d4'; ctx.font = `bold ${Math.round(W * 0.03)}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText(`MobiLens AI Computing${dots}`, W * 0.5, H * 0.11);
  ctx.fillStyle = '#475569'; ctx.font = `${Math.round(W * 0.018)}px sans-serif`;
  ctx.fillText('Real-Time Routing Engine • 4 Recovery Alternatives Ready', W * 0.5, H * 0.17);
  ctx.textAlign = 'left';
}

function renderArrival(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  const prog = Math.min(1, t / 5000);
  const sg = ctx.createLinearGradient(0, 0, 0, H * 0.68);
  sg.addColorStop(0, `rgb(${Math.round(8+55*prog)},${Math.round(10+62*prog)},${Math.round(18+28*prog)})`);
  sg.addColorStop(1, `rgb(${Math.round(16+95*prog)},${Math.round(28+78*prog)},${Math.round(8+18*prog)})`);
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.68);
  // College
  ctx.fillStyle = '#162816'; ctx.fillRect(W * 0.18, H * 0.28, W * 0.64, H * 0.4);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 9; col++) {
    ctx.fillStyle = prog > 0.5 ? 'rgba(255,218,95,0.9)' : (Math.random() > 0.35 ? 'rgba(255,218,95,0.8)' : 'rgba(18,38,18,0.8)');
    ctx.fillRect(W * 0.2 + col * (W * 0.068), H * 0.3 + row * (H * 0.09), W * 0.052, H * 0.065);
  }
  ctx.fillStyle = '#22c55e'; ctx.font = `bold ${Math.round(W * 0.02)}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('FRANCIS XAVIER ENGINEERING COLLEGE', W * 0.5, H * 0.26);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0a1a0a'; ctx.fillRect(0, H * 0.68, W, H * 0.32);
  // Arriving person
  const px = W * 0.08 + prog * W * 0.38;
  drawHuman(ctx, px, H * 0.69, 42, prog > 0.85 ? 0 : (t / 195) % (Math.PI * 2), '#22c55e');
  // Celebration particles
  if (prog > 0.72) {
    const fp = (prog - 0.72) / 0.28;
    for (let i = 0; i < 24; i++) {
      const ppx = px + Math.sin(t / 190 + i * 1.4) * 90 * fp;
      const ppy = H * 0.63 - fp * 110 * ((i % 3) * 0.4 + 0.5);
      ctx.fillStyle = `hsl(${(i * 28 + t / 48) % 360},100%,62%)`;
      ctx.beginPath(); ctx.arc(ppx, ppy, 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Stats card
  const sa = Math.min(1, Math.max(0, (prog - 0.28) / 0.45));
  if (sa > 0) {
    ctx.globalAlpha = sa;
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.beginPath(); ctx.roundRect(W * 0.56, H * 0.08, W * 0.41, H * 0.38, 18); ctx.fill();
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke();
    [
      ['Journey Time', '68 min', '53 min'],
      ['Friction Score', '82/100', '46/100'],
      ['Wait Time', '19 min', '4 min'],
    ].forEach(([label, before, after], i) => {
      const sy = H * 0.13 + i * H * 0.1;
      ctx.fillStyle = '#64748b'; ctx.font = `${Math.round(W * 0.016)}px sans-serif`; ctx.textAlign = 'left';
      ctx.fillText(label, W * 0.585, sy);
      ctx.fillStyle = '#ef4444'; ctx.font = `bold ${Math.round(W * 0.021)}px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(before, W * 0.67, sy + H * 0.055);
      ctx.fillStyle = '#64748b'; ctx.font = `${Math.round(W * 0.015)}px sans-serif`;
      ctx.fillText('→', W * 0.73, sy + H * 0.055);
      ctx.fillStyle = '#22c55e'; ctx.font = `bold ${Math.round(W * 0.022)}px sans-serif`;
      ctx.fillText(after, W * 0.82, sy + H * 0.055);
    });
    ctx.fillStyle = '#22c55e'; ctx.font = `bold ${Math.round(W * 0.019)}px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('4,210 CITIZENS RECLAIM 15 MIN DAILY', W * 0.765, H * 0.44);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export const HackathonDemoVideo: React.FC<HackathonDemoVideoProps> = ({ onClose, onFinished }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const pauseOffsetRef = useRef<number>(0);

  const [currentScene, setCurrentScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  const renderFrame = useCallback((sceneIdx: number, sceneTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    switch (sceneIdx) {
      case 0: renderHome(ctx, W, H, sceneTime); break;
      case 1: renderWalk(ctx, W, H, sceneTime); break;
      case 2: renderBusStop(ctx, W, H, sceneTime); break;
      case 3: renderBus(ctx, W, H, sceneTime); break;
      case 4: renderRisk(ctx, W, H, sceneTime); break;
      case 5: renderAI(ctx, W, H, sceneTime); break;
      case 6: renderArrival(ctx, W, H, sceneTime); break;
    }
    // Fade transitions
    const scene = SCENES[sceneIdx];
    const fadeIn = sceneTime < 700 ? 1 - sceneTime / 700 : 0;
    const fadeOut = sceneTime > scene.duration - 700 ? (sceneTime - (scene.duration - 700)) / 700 : 0;
    const fa = Math.min(1, Math.max(0, fadeIn + fadeOut));
    if (fa > 0) { ctx.fillStyle = `rgba(0,0,0,${fa})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.parentElement?.clientWidth || 800;
    const H = canvas.parentElement?.clientHeight || 450;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    startRef.current = performance.now();

    const loop = (now: number) => {
      if (pausedAtRef.current !== null) { animRef.current = requestAnimationFrame(loop); return; }
      const elapsed = now - startRef.current - pauseOffsetRef.current;
      if (elapsed >= TOTAL_DURATION) {
        renderFrame(SCENES.length - 1, SCENES[SCENES.length - 1].duration);
        setIsEnded(true); setProgress(1); return;
      }
      let cumul = 0, scIdx = 0, scTime = 0;
      for (let i = 0; i < SCENES.length; i++) {
        if (elapsed < cumul + SCENES[i].duration) { scIdx = i; scTime = elapsed - cumul; break; }
        cumul += SCENES[i].duration; scIdx = i; scTime = SCENES[i].duration;
      }
      setCurrentScene(scIdx);
      setProgress(elapsed / TOTAL_DURATION);
      renderFrame(scIdx, scTime);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [renderFrame]);

  const togglePause = () => {
    if (isPaused) {
      if (pausedAtRef.current !== null) { pauseOffsetRef.current += performance.now() - pausedAtRef.current; pausedAtRef.current = null; }
      setIsPaused(false);
    } else { pausedAtRef.current = performance.now(); setIsPaused(true); }
  };

  const scene = SCENES[Math.min(currentScene, SCENES.length - 1)];

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-black via-slate-950 to-black border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">MobiLens AI  •  Hackathon Demo  •  Live Simulation</span>
        </div>
        <button type="button" onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" title="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Bottom left scene caption */}
        <div className="absolute bottom-4 left-4 max-w-[55%] pointer-events-none">
          <div className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{ background: scene?.accentColor + '22', color: scene?.accentColor, border: `1px solid ${scene?.accentColor}44` }}>
            {scene?.title}
          </div>
          <div className="text-white/50 text-[11px] mb-0.5">{scene?.subtitle}</div>
          <p className="text-white/90 text-[13px] font-medium leading-snug drop-shadow-xl">{scene?.caption}</p>
        </div>

        {/* Scene timeline (right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 items-end pointer-events-none">
          {SCENES.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono transition-all ${currentScene === i ? 'text-white' : 'text-white/25'}`}>
                {s.title.split(' — ')[0]}
              </span>
              <div className="w-1 rounded-full transition-all duration-300"
                style={{ height: currentScene === i ? '22px' : '6px', backgroundColor: currentScene === i ? s.accentColor : '#ffffff22' }} />
            </div>
          ))}
        </div>

        {/* Ended overlay */}
        {isEnded && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <div className="text-green-400 text-lg font-bold tracking-wide uppercase">Journey Complete</div>
            <div className="text-4xl font-black text-white text-center">15 Minutes Reclaimed</div>
            <div className="text-white/60 text-sm">4,210 citizens benefit every single day</div>
            <button type="button" onClick={onFinished}
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-cyan-500/30">
              Continue to Full Hackathon Demo →
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/95 border-t border-white/10 px-4 pb-3 pt-2">
        {/* Progress */}
        <div className="w-full h-1.5 rounded-full bg-white/10 mb-2.5 relative overflow-hidden cursor-pointer">
          <div className="h-full rounded-full transition-none"
            style={{ width: `${progress * 100}%`, backgroundColor: scene?.accentColor || '#06b6d4' }} />
          {SCENES.slice(0, -1).map((s, i) => {
            const pos = SCENES.slice(0, i + 1).reduce((a, sc) => a + sc.duration, 0) / TOTAL_DURATION * 100;
            return <div key={s.id} className="absolute top-0 bottom-0 w-px bg-white/25" style={{ left: `${pos}%` }} />;
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <button type="button" onClick={togglePause}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => setIsMuted(m => !m)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" title="(Cinematic mode - no audio)">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="flex-1 text-center">
            <span className="text-white/40 text-xs">Scene {currentScene + 1}/{SCENES.length}</span>
            <span className="mx-1.5 text-white/20">•</span>
            <span className="text-white/80 text-xs font-semibold">{scene?.title}</span>
          </div>
          <button type="button" onClick={onFinished}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors">
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip to Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonDemoVideo;
