'use client'

import { useEffect, useState } from 'react'
import {
  IconTerminal2, IconUser, IconLock, IconMail,
  IconPlayerPlay, IconEye, IconEyeOff, IconAlertCircle,
  IconGhost,
} from '@tabler/icons-react'
import { useAuthStore } from '@/lib/authStore'
import type { AuthUser } from '@/lib/authStore'

interface AuthGateProps {
  children: React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading, setUser, setLoading, loginAsGuest } = useAuthStore()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => { setUser(user); setLoading(false) })
      .catch(() => setLoading(false))
  }, [setUser, setLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
        <div className="font-display text-5xl font-black" style={{ color: '#00ff88', textShadow: '0 0 30px #00ff88' }}>
          SNAKE<span style={{ color: '#00e5ff' }}>X</span>
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-neon-green animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return <AuthScreen onAuth={setUser} onGuest={loginAsGuest} />

  return <>{children}</>
}

function AuthScreen({ onAuth, onGuest }: { onAuth: (u: AuthUser) => void; onGuest: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setForm(f => ({ ...f, [key]: key === 'username' ? e.target.value.toUpperCase() : e.target.value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { login: form.username || form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro desconhecido'); return }
      onAuth(data.user)
    } catch {
      setError('Falha na conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.04) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)' }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <IconTerminal2 size={28} className="text-neon-green" style={{ filter: 'drop-shadow(0 0 10px #00ff88)' }} />
            <div className="font-display text-5xl font-black tracking-tighter" style={{ color: '#00ff88', textShadow: '0 0 25px #00ff88' }}>
              SNAKE<span style={{ color: '#00e5ff' }}>X</span>
            </div>
          </div>
          <p className="font-mono text-[10px] tracking-[0.4em] text-dark-300">SISTEMA NEURAL v3.0</p>
        </div>

        <div className="flex rounded border border-dark-500 overflow-hidden">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2.5 font-mono text-xs tracking-wider transition-all"
              style={{
                background: mode === m ? '#00ff8815' : 'transparent',
                color: mode === m ? '#00ff88' : '#4a6070',
                borderBottom: mode === m ? '1px solid #00ff88' : '1px solid transparent',
              }}
            >
              {m === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <InputField
              icon={<IconUser size={15} />}
              placeholder="USERNAME (3-16 chars)"
              value={form.username}
              onChange={field('username')}
              maxLength={16}
              autoComplete="username"
            />
          )}

          <InputField
            icon={<IconMail size={15} />}
            placeholder={mode === 'login' ? 'EMAIL OU USERNAME' : 'EMAIL'}
            value={mode === 'login' ? (form.username || form.email) : form.email}
            onChange={(e) => {
              setError('')
              if (mode === 'login') {
                setForm(f => ({ ...f, username: '', email: e.target.value }))
              } else {
                setForm(f => ({ ...f, email: e.target.value }))
              }
            }}
            type="email"
            autoComplete="email"
          />

          <div className="relative">
            <InputField
              icon={<IconLock size={15} />}
              placeholder="SENHA"
              value={form.password}
              onChange={field('password')}
              type={showPass ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-neon-green transition-colors"
            >
              {showPass ? <IconEyeOff size={15} /> : <IconEye size={15} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded border" style={{ borderColor: '#ff008040', background: '#ff000810', color: '#ff0080' }}>
              <IconAlertCircle size={13} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-4 rounded border font-mono text-sm tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderColor: '#00ff8860', color: '#00ff88', background: '#00ff8815', boxShadow: '0 0 20px #00ff8820' }}
          >
            <IconPlayerPlay size={16} />
            {loading ? 'AGUARDE...' : mode === 'login' ? 'ENTRAR NO JOGO' : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-dark-600" />
          <span className="text-dark-400 font-mono text-[10px]">OU</span>
          <div className="flex-1 h-px bg-dark-600" />
        </div>

        <button
          onClick={onGuest}
          className="flex items-center justify-center gap-2 py-3.5 rounded border font-mono text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: '#ffffff15', color: '#8899aa', background: '#ffffff05' }}
        >
          <IconGhost size={16} />
          JOGAR SEM CONTA
        </button>

        <p className="text-center text-[10px] font-mono text-dark-500 -mt-2">
          Convidados não aparecem no ranking global e não salvam progresso
        </p>
      </div>
    </div>
  )
}

function InputField({
  icon, placeholder, value, onChange, type = 'text', maxLength, autoComplete,
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  maxLength?: number
  autoComplete?: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded border border-dark-500 bg-dark-800 focus-within:border-neon-green/40 transition-colors">
      <span className="text-dark-300 flex-shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required
        className="flex-1 bg-transparent font-mono text-sm text-neon-green placeholder:text-dark-400 outline-none tracking-wider"
      />
    </div>
  )
}
