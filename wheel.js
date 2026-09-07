/**
 * HTML5 2D Canvas Physics Engine for Spin Wheels
 * High Performance Edition with Offscreen Canvas Caching & Adjustable Friction
 */

import { soundEngine } from './audio.js';

export class SpinWheel {
  constructor(canvasId, config, onFinishCallback) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.config = config; // { id, title, items, colorPalette }
    this.onFinishCallback = onFinishCallback;

    this.currentAngle = 0; // angle in radians
    this.isSpinning = false;
    this.spinVelocity = 0;
    this.friction = 0.978; // Turbo snappy friction (~2.0s spin time)
    this.stopThreshold = 0.0012;

    this.lastPassedSlice = -1;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    this.isCacheValid = false;

    this.resizeCanvas();
    this.draw();
  }

  setSpinSpeed(speedMode) {
    if (speedMode === 'turbo') {
      this.friction = 0.965; // ~1.2s spin
    } else if (speedMode === 'instant') {
      this.friction = 0.90; // ~0.5s spin
    } else {
      this.friction = 0.978; // ~2.0s snappy default
    }
  }

  updateConfig(newConfig) {
    this.config = newConfig;
    this.isCacheValid = false;
    this.draw();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const size = Math.min(parent ? parent.clientWidth || 320 : 320, 380);
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.scale(dpr, dpr);
    this.size = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size / 2 - 15; // 15px padding for pointer & border

    this.offscreenCanvas.width = size * dpr;
    this.offscreenCanvas.height = size * dpr;
    this.offscreenCtx.scale(dpr, dpr);

    this.isCacheValid = false;
  }

  // Pre-renders static wheel artwork onto offscreen canvas for ultra-fast 60fps rotation
  renderToCache() {
    if (!this.offscreenCtx || !this.config || !this.config.items || this.config.items.length === 0) return;

    const items = this.config.items;
    const numSlices = items.length;
    const sliceAngle = (Math.PI * 2) / numSlices;
    const colors = this.config.colorPalette || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    this.offscreenCtx.clearRect(0, 0, this.size, this.size);

    this.offscreenCtx.save();
    this.offscreenCtx.translate(this.centerX, this.centerY);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const fillColor = colors[i % colors.length];

      // Draw slice background
      this.offscreenCtx.beginPath();
      this.offscreenCtx.moveTo(0, 0);
      this.offscreenCtx.arc(0, 0, this.radius, startAngle, endAngle);
      this.offscreenCtx.closePath();

      this.offscreenCtx.fillStyle = fillColor;
      this.offscreenCtx.fill();

      this.offscreenCtx.lineWidth = 1.5;
      this.offscreenCtx.strokeStyle = '#1E293B';
      this.offscreenCtx.stroke();

      // Draw slice text
      this.offscreenCtx.save();
      const textAngle = startAngle + sliceAngle / 2;
      this.offscreenCtx.rotate(textAngle);

      this.offscreenCtx.fillStyle = '#FFFFFF';
      this.offscreenCtx.shadowColor = 'rgba(0,0,0,0.6)';
      this.offscreenCtx.shadowBlur = 3;
      this.offscreenCtx.font = `bold ${Math.max(10, Math.min(14, 180 / numSlices))}px Inter, sans-serif`;
      this.offscreenCtx.textAlign = 'right';
      this.offscreenCtx.textBaseline = 'middle';

      let text = items[i] || '';
      const maxTextWidth = this.radius - 35;
      if (this.offscreenCtx.measureText(text).width > maxTextWidth) {
        while (text.length > 3 && this.offscreenCtx.measureText(text + '...').width > maxTextWidth) {
          text = text.slice(0, -1);
        }
        text += '...';
      }

      this.offscreenCtx.fillText(text, this.radius - 12, 0);
      this.offscreenCtx.restore();
    }

    // Outer Rim Glow / Border
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(0, 0, this.radius, 0, Math.PI * 2);
    this.offscreenCtx.lineWidth = 4;
    this.offscreenCtx.strokeStyle = '#38BDF8';
    this.offscreenCtx.stroke();

    // Center Hub Knob
    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(0, 0, 22, 0, Math.PI * 2);
    this.offscreenCtx.fillStyle = '#0F172A';
    this.offscreenCtx.fill();
    this.offscreenCtx.lineWidth = 3;
    this.offscreenCtx.strokeStyle = '#38BDF8';
    this.offscreenCtx.stroke();

    this.offscreenCtx.beginPath();
    this.offscreenCtx.arc(0, 0, 8, 0, Math.PI * 2);
    this.offscreenCtx.fillStyle = '#38BDF8';
    this.offscreenCtx.fill();

    this.offscreenCtx.restore();

    this.isCacheValid = true;
  }

  draw() {
    if (!this.ctx) return;
    if (!this.isCacheValid) {
      this.renderToCache();
    }

    this.ctx.clearRect(0, 0, this.size, this.size);

    // Blit pre-rendered wheel from offscreen canvas with current rotation angle
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.currentAngle);
    this.ctx.drawImage(this.offscreenCanvas, -this.centerX, -this.centerY, this.size, this.size);
    this.ctx.restore();

    // Stationary top pointer pin
    this.drawPointer();
  }

  drawPointer() {
    this.ctx.save();
    this.ctx.translate(this.centerX, 12);

    this.ctx.beginPath();
    this.ctx.moveTo(-12, 0);
    this.ctx.lineTo(12, 0);
    this.ctx.lineTo(0, 22);
    this.ctx.closePath();

    this.ctx.fillStyle = '#F43F5E';
    this.ctx.fill();

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.stroke();

    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetY = 2;

    this.ctx.restore();
  }

  spin(customTargetVelocity = null) {
    if (this.isSpinning || !this.config.items || this.config.items.length === 0) return;

    soundEngine.init();

    this.spinVelocity = customTargetVelocity || (0.42 + Math.random() * 0.25);
    this.isSpinning = true;

    this.animate();
  }

  animate() {
    if (!this.isSpinning) return;

    this.currentAngle = (this.currentAngle + this.spinVelocity) % (Math.PI * 2);
    this.spinVelocity *= this.friction;

    // Audio tick trigger
    const numSlices = this.config.items.length;
    if (numSlices > 0) {
      const sliceAngle = (Math.PI * 2) / numSlices;
      let pointerAngle = (Math.PI * 1.5 - this.currentAngle) % (Math.PI * 2);
      if (pointerAngle < 0) pointerAngle += Math.PI * 2;

      const currentSlice = Math.floor(pointerAngle / sliceAngle);
      if (currentSlice !== this.lastPassedSlice) {
        soundEngine.playTick();
        this.lastPassedSlice = currentSlice;
      }
    }

    this.draw();

    if (this.spinVelocity < this.stopThreshold) {
      this.isSpinning = false;
      this.spinVelocity = 0;
      this.draw();
      this.onSpinComplete();
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }

  onSpinComplete() {
    const numSlices = this.config.items.length;
    if (numSlices === 0) return;

    const sliceAngle = (Math.PI * 2) / numSlices;
    let pointerAngle = (Math.PI * 1.5 - this.currentAngle) % (Math.PI * 2);
    if (pointerAngle < 0) pointerAngle += Math.PI * 2;

    const winningIndex = Math.floor(pointerAngle / sliceAngle) % numSlices;
    const winningItem = this.config.items[winningIndex];

    soundEngine.playFanfare();

    if (this.onFinishCallback) {
      this.onFinishCallback(winningItem, winningIndex, this.config.id);
    }
  }

  getCurrentWinningItem() {
    const numSlices = this.config.items.length;
    if (numSlices === 0) return 'N/A';

    const sliceAngle = (Math.PI * 2) / numSlices;
    let pointerAngle = (Math.PI * 1.5 - this.currentAngle) % (Math.PI * 2);
    if (pointerAngle < 0) pointerAngle += Math.PI * 2;

    const winningIndex = Math.floor(pointerAngle / sliceAngle) % numSlices;
    return this.config.items[winningIndex] || 'N/A';
  }
}
