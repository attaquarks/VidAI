// Vercel Node function: the Express API, serverless.
// server.js skips app.listen under VERCEL and exports the handler.
import app from '../server/server.js'

export default async function handler(req, res) {
  return app(req, res)
}
