'use client'

type SoundName = 'eat' | 'boost' | 'wall' | 'explode' | 'death' | 'levelup' | 'menu_select'

class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.ctx
  }

  setEnabled(val: boolean) {
    this.enabled = val
  }

  play(name: SoundName) {
    if (!this.enabled) return
    try {
      const ctx = this.getCtx()
      switch (name) {
        case 'eat': this.playTone(ctx, 880, 0.1, 'square', 0.08); break
        case 'boost': this.playSweep(ctx, 200, 800, 0.15, 0.2); break
        case 'wall': this.playTone(ctx, 220, 0.15, 'sawtooth', 0.15); break
        case 'explode': this.playNoise(ctx, 0.3, 0.25); break
        case 'death': this.playDeath(ctx); break
        case 'levelup': this.playLevelUp(ctx); break
        case 'menu_select': this.playTone(ctx, 660, 0.08, 'sine', 0.06); break
      }
    } catch {}
  }

  private playTone(ctx: AudioContext, freq: number, vol: number, type: OscillatorType, dur: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  }

  private playSweep(ctx: AudioContext, from: number, to: number, vol: number, dur: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(from, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + dur)
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  }

  private playNoise(ctx: AudioContext, vol: number, dur: number) {
    const bufferSize = ctx.sampleRate * dur
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    source.buffer = buffer
    source.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.value = vol
    source.start()
  }

  private playDeath(ctx: AudioContext) {
    [440, 330, 220, 110].forEach((freq, i) => {
      setTimeout(() => this.playTone(ctx, freq, 0.2, 'sawtooth', 0.15), i * 80)
    })
  }

  private playLevelUp(ctx: AudioContext) {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(ctx, freq, 0.15, 'sine', 0.1), i * 100)
    })
  }
}

export const soundManager = new SoundManager()
