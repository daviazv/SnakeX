import type { GameState, SkinConfig } from '@/types'
import { GRID_SIZE, CANVAS_COLS, CANVAS_ROWS } from '@/lib/constants'

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  skin: SkinConfig,
  tick: number
) {
  const W = CANVAS_COLS * GRID_SIZE
  const H = CANVAS_ROWS * GRID_SIZE

  ctx.fillStyle = '#020408'
  ctx.fillRect(0, 0, W, H)

  drawGrid(ctx, W, H)
  drawWalls(ctx, state, tick)
  drawFood(ctx, state, tick)
  drawExplosions(ctx, state)
  drawSnake(ctx, state, skin, tick)
  drawParticles(ctx, state)
}

function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= W; x += GRID_SIZE) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y <= H; y += GRID_SIZE) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, W, H)
}

function drawFood(ctx: CanvasRenderingContext2D, state: GameState, tick: number) {
  state.food.forEach((food) => {
    const px = food.x * GRID_SIZE + GRID_SIZE / 2
    const py = food.y * GRID_SIZE + GRID_SIZE / 2
    const pulse = Math.sin(tick * 0.12 + food.x * 0.5) * 0.3 + 0.7
    const baseR = food.type === 'mega' ? 9 : food.type === 'bonus' ? 7 : 5
    const r = baseR * pulse

    const colors: Record<typeof food.type, string[]> = {
      normal: ['#00ff88', '#004422'],
      bonus: ['#ffee00', '#442200'],
      mega: ['#ff6600', '#440000'],
    }
    const [bright, dark] = colors[food.type]

    ctx.shadowBlur = 15 * pulse
    ctx.shadowColor = bright

    const grad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r)
    grad.addColorStop(0, bright)
    grad.addColorStop(1, dark)

    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    ctx.arc(px - r * 0.25, py - r * 0.25, r * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fill()

    ctx.shadowBlur = 0
  })
}

function drawWalls(ctx: CanvasRenderingContext2D, state: GameState, tick: number) {
  state.walls.forEach((wall) => {
    const px = wall.x * GRID_SIZE
    const py = wall.y * GRID_SIZE
    const age = (Date.now() - wall.spawnTime) / wall.duration
    const alpha = age > 0.7 ? (1 - age) * 3.33 : 1
    const pulse = Math.sin(tick * 0.15) * 0.2 + 0.8

    ctx.shadowBlur = 12 * pulse
    ctx.shadowColor = `rgba(0, 229, 255, ${alpha})`
    ctx.fillStyle = `rgba(0, 100, 180, ${alpha * 0.6})`
    ctx.fillRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2)

    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`
    ctx.lineWidth = 1.5
    ctx.strokeRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2)
    ctx.shadowBlur = 0
  })
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  skin: SkinConfig,
  tick: number
) {
  const { snake, boostActive } = state
  if (snake.length === 0) return

  const glowIntensity = boostActive ? 30 : 12
  const pulseVal = skin.pattern === 'pulse' ? Math.sin(tick * 0.2) * 0.3 + 0.7 : 1

  snake.forEach((seg, idx) => {
    const isHead = idx === 0
    const progress = idx / snake.length
    const px = seg.x * GRID_SIZE
    const py = seg.y * GRID_SIZE
    const margin = isHead ? 1 : 2
    const size = GRID_SIZE - margin * 2

    let color = skin.bodyColor
    if (skin.pattern === 'rainbow') {
      const hue = ((tick * 2 + idx * 15) % 360)
      color = `hsl(${hue}, 100%, 60%)`
    } else if (skin.pattern === 'gradient') {
      const t = 1 - progress * 0.6
      color = interpolateColor(skin.headColor, skin.bodyColor, progress * 0.7)
    } else {
      color = idx === 0 ? skin.headColor : skin.bodyColor
    }

    ctx.shadowBlur = (isHead ? glowIntensity * 1.5 : glowIntensity * (1 - progress * 0.7)) * pulseVal
    ctx.shadowColor = skin.glowColor

    const radius = isHead ? 5 : 4
    ctx.fillStyle = color
    roundRect(ctx, px + margin, py + margin, size, size, radius)
    ctx.fill()

    if (isHead) {
      drawSnakeEyes(ctx, seg, skin, tick)
    }

    if (boostActive && idx < 5) {
      const trailAlpha = (1 - idx / 5) * 0.4
      ctx.fillStyle = skin.trailColor.replace('40', Math.floor(trailAlpha * 255).toString(16).padStart(2, '0'))
      roundRect(ctx, px + margin, py + margin, size, size, radius)
      ctx.fill()
    }

    ctx.shadowBlur = 0
  })
}

function drawSnakeEyes(
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number; direction: string },
  skin: SkinConfig,
  tick: number
) {
  const cx = head.x * GRID_SIZE + GRID_SIZE / 2
  const cy = head.y * GRID_SIZE + GRID_SIZE / 2
  const blink = tick % 120 < 4

  const eyeOffset = 4
  let eye1 = { x: cx, y: cy }
  let eye2 = { x: cx, y: cy }

  if (head.direction === 'RIGHT') { eye1 = { x: cx + 3, y: cy - eyeOffset }; eye2 = { x: cx + 3, y: cy + eyeOffset } }
  if (head.direction === 'LEFT') { eye1 = { x: cx - 3, y: cy - eyeOffset }; eye2 = { x: cx - 3, y: cy + eyeOffset } }
  if (head.direction === 'UP') { eye1 = { x: cx - eyeOffset, y: cy - 3 }; eye2 = { x: cx + eyeOffset, y: cy - 3 } }
  if (head.direction === 'DOWN') { eye1 = { x: cx - eyeOffset, y: cy + 3 }; eye2 = { x: cx + eyeOffset, y: cy + 3 } }

  const eyeH = blink ? 1 : 3
  ;[eye1, eye2].forEach((eye) => {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.ellipse(eye.x, eye.y, 2.5, eyeH, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(eye.x, eye.y, 1.2, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawExplosions(ctx: CanvasRenderingContext2D, state: GameState) {
  state.explosions.forEach((exp) => {
    const px = exp.x * GRID_SIZE + GRID_SIZE / 2
    const py = exp.y * GRID_SIZE + GRID_SIZE / 2
    const r = exp.radius * GRID_SIZE
    const alpha = Math.max(0, 1 - exp.progress)

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r)
    grad.addColorStop(0, `rgba(255, 200, 50, ${alpha * 0.8})`)
    grad.addColorStop(0.4, `rgba(255, 100, 0, ${alpha * 0.5})`)
    grad.addColorStop(1, `rgba(255, 50, 0, 0)`)

    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    ctx.arc(px, py, r * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`
    ctx.fill()
  })
}

function drawParticles(ctx: CanvasRenderingContext2D, state: GameState) {
  state.particles.forEach((p) => {
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.shadowBlur = 6
    ctx.shadowColor = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  })
  ctx.globalAlpha = 1
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
  const [r1, g1, b1] = parse(c1)
  const [r2, g2, b2] = parse(c2)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r}, ${g}, ${b})`
}
