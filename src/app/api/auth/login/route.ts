import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { signToken, makeAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json()

    if (!login || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({
      $or: [
        { username: login.toUpperCase() },
        { email: login.toLowerCase() },
      ],
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 })
    }

    const token = signToken({ userId: user._id.toString(), username: user.username })
    const res = NextResponse.json({
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
    res.headers.set('Set-Cookie', makeAuthCookie(token))
    return res
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
