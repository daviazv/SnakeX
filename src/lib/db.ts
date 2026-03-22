import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.warn('[DB] MONGODB_URI não configurado no .env')
}

declare global {
  var _mongooseConn: typeof mongoose | null
  var _mongoosePromise: Promise<typeof mongoose> | null
}

let cached = global._mongooseConn
let cachedPromise = global._mongoosePromise

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached = await cachedPromise
  global._mongooseConn = cached
  global._mongoosePromise = cachedPromise
  return cached
}
