import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const top = await User.find({ highScore: { $gt: 0 } })
      .sort({ highScore: -1 })
      .limit(20)
      .select('username highScore level updatedAt')
      .lean()

    const entries = top.map((u, i) => ({
      rank: i + 1,
      userId: u._id.toString(),
      name: u.username || "???",
      score: u.highScore ?? 0,
      level: u.level ?? 0,
      date: new Date(u.updatedAt as Date).toLocaleDateString('pt-BR'),
    }))

    return NextResponse.json({ entries })
  } catch (err) {
    console.error('[leaderboard]', err)
    return NextResponse.json({ entries: [] })
  }
}
