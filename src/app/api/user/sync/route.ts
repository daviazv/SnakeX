import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { getAuthUser } from '@/lib/auth'
import { SKINS } from '@/lib/constants'
import type { SkinId } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { score, level, xp, skin, unlockedSkins } = await req.json()

    await connectDB()
    const user = await User.findById(auth.userId)
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    if (score > user.highScore) user.highScore = score
    if (level > user.level) user.level = level
    if (xp !== undefined) user.xp = xp
    if (skin) user.skin = skin
    if (unlockedSkins?.length) {
      const merged = new Set([...user.unlockedSkins, ...unlockedSkins])
      user.unlockedSkins = Array.from(merged) as SkinId[]
    }

    const earned = SKINS.filter(s => user.level >= s.requiredLevel).map(s => s.id as SkinId)
    const merged = new Set([...earned, ...(user.unlockedSkins as SkinId[])])
    user.unlockedSkins = Array.from(merged)

    await user.save()
    return NextResponse.json({ ok: true, highScore: user.highScore })
  } catch (err) {
    console.error('[user/sync]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
