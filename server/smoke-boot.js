/**
 * Boot the server against a throwaway in-memory MongoDB (dev/test only).
 * Usage: node smoke-boot.js — then run `node scripts/smoke.js` from the root.
 */
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create()
// Set before server.js's dotenv import — dotenv never overrides existing vars
process.env.MONGODB_URI = mongod.getUri('vidai')
console.log(`In-memory MongoDB at ${process.env.MONGODB_URI}`)
await import('./server.js')
