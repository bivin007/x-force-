/**
 * Audio Waveform Visualizer
 * Renders an animated equalizer/waveform effect when speech is synthesized or microphone is active.
 */

export class AudioVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.isActive = false;
    this.bars = 24;
    this.animationId = null;
    this.phase = 0;
    this.color = '#38bdf8';
  }

  start(color = '#38bdf8') {
    this.isActive = true;
    this.color = color;
    if (!this.animationId) {
      this._renderLoop();
    }
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this._clear();
  }

  _clear() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw flat idle line
    const h = this.canvas.height / 2;
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(0, h);
    this.ctx.lineTo(this.canvas.width, h);
    this.ctx.stroke();
  }

  _renderLoop() {
    if (!this.isActive) {
      this._clear();
      return;
    }

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.phase += 0.15;

    const barWidth = width / this.bars;
    const centerY = height / 2;

    for (let i = 0; i < this.bars; i++) {
      const x = i * barWidth;
      const normalizedIdx = i / this.bars;
      // Synthesize organic speech-like wave heights
      const wave = Math.sin(this.phase + i * 0.4) * Math.cos(this.phase * 0.5 + i * 0.2);
      const randomJitter = (Math.random() * 0.3 + 0.7);
      const barHeight = Math.max(4, Math.abs(wave) * (height * 0.8) * randomJitter);

      const gradient = this.ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, '#818cf8');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.roundRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight, 3);
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this._renderLoop());
  }
}
