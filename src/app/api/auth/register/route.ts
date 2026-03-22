import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'
import { signToken, makeAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }
    if (username.length < 3 || username.length > 16) {
      return NextResponse.json({ error: 'Nome deve ter entre 3 e 16 caracteres' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({
      $or: [
        { username: username.toUpperCase() },
        { email: email.toLowerCase() },
      ],
    })

    if (existing) {
      const field = existing.username === username.toUpperCase() ? 'Username' : 'Email'
      return NextResponse.json({ error: `${field} já está em uso` }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      username: username.toUpperCase().slice(0, 16),
      email: email.toLowerCase(),
      passwordHash,
    })

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
    console.error('[register]', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
