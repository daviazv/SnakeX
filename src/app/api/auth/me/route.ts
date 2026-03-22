import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ user: null })

    await connectDB()
    const user = await User.findById(auth.userId).lean()
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        level: user.level,
        xp: user.xp,
        highScore: user.highScore,
        skin: user.skin,
        unlockedSkins: user.unlockedSkins,
      },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
