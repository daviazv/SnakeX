import type { MultiSnapshot } from '@/types/multi'
import { GRID_SIZE, CANVAS_COLS, CANVAS_ROWS, getSkin } from '@/lib/constants'

const SKIN_GLOW: Record<string, string> = {
  default: '#00ff88', neon: '#00e5ff', cyber: '#ff0080',
  fire: '#ff6600', ice: '#88ccff', void: '#8000ff',
  gold: '#ffee00', plasma: '#ffffff',
}

export function renderMultiGame(
  ctx: CanvasRenderingContext2D,
  snapshot: MultiSnapshot,
  localPlayerId: string,
  tick: number,
  explosions: { x: number; y: number; progress: number }[]
) {
  const W = CANVAS_COLS * GRID_SIZE
  const H = CANVAS_ROWS * GRID_SIZE

  ctx.fillStyle = '#020408'
  ctx.fillRect(0, 0, W, H)

  drawGrid(ctx, W, H)
  drawWalls(ctx, snapshot, tick)
  drawFood(ctx, snapshot, tick)
  drawExplosionEffects(ctx, explosions)

  const players = Object.values(snapshot.players)
  players.filter(p => !p.alive).forEach(p => drawSnake(ctx, p, false, tick))
  players.filter(p => p.alive).forEach(p => drawSnake(ctx, p, p.id === localPlayerId, tick))

  drawScoreTags(ctx, snapshot, localPlayerId)
}

function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.strokeStyle = 'rgba(0,255,136,0.04)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= W; x += GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(0,255,136,0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, W, H)
}

function drawFood(ctx: CanvasRenderingContext2D, snapshot: MultiSnapshot, tick: number) {
  snapshot.food.forEach(food => {
    const px = food.x * GRID_SIZE + GRID_SIZE / 2
    const py = food.y * GRID_SIZE + GRID_SIZE / 2
    const pulse = Math.sin(tick * 0.12 + food.x * 0.5) * 0.3 + 0.7
    const baseR = food.type === 'mega' ? 9 : food.type === 'bonus' ? 7 : 5
    const r = baseR * pulse
    const colors: Record<string, string[]> = {
      normal: ['#00ff88', '#004422'],
      bonus:  ['#ffee00', '#442200'],
      mega:   ['#ff6600', '#440000'],
    }
    const [bright, dark] = colors[food.type] || colors.normal
    ctx.shadowBlur = 15 * pulse
    ctx.shadowColor = bright
    const grad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r)
    grad.addColorStop(0, bright); grad.addColorStop(1, dark)
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = grad; ctx.fill()
    ctx.beginPath(); ctx.arc(px - r * 0.25, py - r * 0.25, r * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill()
    ctx.shadowBlur = 0
  })
}

function drawWalls(ctx: CanvasRenderingContext2D, snapshot: MultiSnapshot, tick: number) {
  const now = Date.now()
  snapshot.walls.forEach(wall => {
    const px = wall.x * GRID_SIZE, py = wall.y * GRID_SIZE
    const age = Math.min((now - wall.spawnTime) / wall.duration, 1)
    const alpha = age > 0.7 ? (1 - age) * 3.33 : 1
    const pulse = Math.sin(tick * 0.15) * 0.2 + 0.8
    ctx.shadowBlur = 12 * pulse
    ctx.shadowColor = `rgba(0,229,255,${alpha})`
    ctx.fillStyle = `rgba(0,100,180,${alpha * 0.6})`
    ctx.fillRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2)
    ctx.strokeStyle = `rgba(0,229,255,${alpha})`
    ctx.lineWidth = 1.5
    ctx.strokeRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2)
    ctx.shadowBlur = 0
  })
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  player: { id: string; snake: { x: number; y: number; direction: string }[]; skin: string; alive: boolean; boostActive: boolean },
  isLocal: boolean,
  tick: number
) {
  if (player.snake.length === 0) return
  const skin = getSkin(player.skin)
  const alpha = player.alive ? 1 : 0.3

  player.snake.forEach((seg, idx) => {
    const isHead = idx === 0
    const progress = idx / player.snake.length
    const px = seg.x * GRID_SIZE, py = seg.y * GRID_SIZE
    const margin = isHead ? 1 : 2
    const size = GRID_SIZE - margin * 2

    let color = idx === 0 ? skin.headColor : skin.bodyColor
    if (skin.pattern === 'rainbow') {
      color = `hsl(${(tick * 2 + idx * 15) % 360},100%,60%)`
    } else if (skin.pattern === 'gradient') {
      color = interpolateColor(skin.headColor, skin.bodyColor, progress * 0.7)
    }

    const glow = (isHead ? 14 : 8) * (1 - progress * 0.5)
    ctx.globalAlpha = alpha
    ctx.shadowBlur = isLocal ? glow * 1.4 : glow * 0.7
    ctx.shadowColor = skin.glowColor
    ctx.fillStyle = color
    roundRect(ctx, px + margin, py + margin, size, size, isHead ? 5 : 4)
    ctx.fill()

    if (isLocal && isHead) {
      ctx.shadowBlur = 0
      drawEyes(ctx, seg, tick)
    }

    if (isLocal && player.boostActive && idx < 5) {
      ctx.fillStyle = skin.trailColor
      ctx.globalAlpha = (1 - idx / 5) * 0.35 * alpha
      roundRect(ctx, px + margin, py + margin, size, size, 4)
      ctx.fill()
    }

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  })
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number; direction: string },
  tick: number
) {
  const cx = head.x * GRID_SIZE + GRID_SIZE / 2
  const cy = head.y * GRID_SIZE + GRID_SIZE / 2
  const blink = tick % 120 < 4
  const eyeOffset = 4
  let e1 = { x: cx, y: cy }, e2 = { x: cx, y: cy }
  if (head.direction === 'RIGHT') { e1 = { x: cx+3, y: cy-eyeOffset }; e2 = { x: cx+3, y: cy+eyeOffset } }
  if (head.direction === 'LEFT')  { e1 = { x: cx-3, y: cy-eyeOffset }; e2 = { x: cx-3, y: cy+eyeOffset } }
  if (head.direction === 'UP')    { e1 = { x: cx-eyeOffset, y: cy-3 }; e2 = { x: cx+eyeOffset, y: cy-3 } }
  if (head.direction === 'DOWN')  { e1 = { x: cx-eyeOffset, y: cy+3 }; e2 = { x: cx+eyeOffset, y: cy+3 } }
  const eyeH = blink ? 1 : 3
  ;[e1, e2].forEach(e => {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(e.x, e.y, 2.5, eyeH, 0, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(e.x, e.y, 1.2, 0, Math.PI*2); ctx.fill()
  })
}

function drawScoreTags(
  ctx: CanvasRenderingContext2D,
  snapshot: MultiSnapshot,
  localPlayerId: string
) {
  Object.values(snapshot.players).forEach(player => {
    if (player.snake.length === 0) return
    const head = player.snake[0]
    const px = head.x * GRID_SIZE + GRID_SIZE / 2
    const py = head.y * GRID_SIZE - 8
    const skin = getSkin(player.skin)
    const alpha = player.alive ? 1 : 0.4
    const isLocal = player.id === localPlayerId

    ctx.globalAlpha = alpha
    ctx.font = `bold ${isLocal ? 11 : 10}px "Share Tech Mono", monospace`
    ctx.textAlign = 'center'

    const label = `${player.name} ${player.score}`
    const tw = ctx.measureText(label).width + 8
    const th = 14

    ctx.fillStyle = `rgba(2,4,8,0.75)`
    roundRect(ctx, px - tw/2, py - th, tw, th, 3)
    ctx.fill()

    ctx.shadowBlur = isLocal ? 6 : 3
    ctx.shadowColor = skin.glowColor
    ctx.fillStyle = isLocal ? skin.glowColor : skin.bodyColor
    ctx.fillText(label, px, py - 3)
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
    ctx.textAlign = 'left'
  })
}

function drawExplosionEffects(
  ctx: CanvasRenderingContext2D,
  explosions: { x: number; y: number; progress: number }[]
) {
  explosions.forEach(exp => {
    const px = exp.x * GRID_SIZE + GRID_SIZE / 2
    const py = exp.y * GRID_SIZE + GRID_SIZE / 2
    const r = EXPLODE_R * GRID_SIZE * Math.min(exp.progress, 1)
    const alpha = Math.max(0, 1 - exp.progress)
    const grad = ctx.createRadialGradient(px, py, 0, px, py, r)
    grad.addColorStop(0, `rgba(255,200,50,${alpha * 0.8})`)
    grad.addColorStop(0.4, `rgba(255,100,0,${alpha * 0.5})`)
    grad.addColorStop(1, `rgba(255,50,0,0)`)
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = grad; ctx.fill()
  })
}

const EXPLODE_R = 3

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
  const p = (h: string) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
  const [r1,g1,b1] = p(c1); const [r2,g2,b2] = p(c2)
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`
}
