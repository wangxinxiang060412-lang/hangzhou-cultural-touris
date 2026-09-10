import { spawn } from 'node:child_process'

const apiPort = process.env.API_PORT || '3001'
const env = {
  ...process.env,
  API_PORT: apiPort,
  VITE_API_BASE_URL: `http://localhost:${apiPort}/api`,
}

const children = [
  spawn(process.execPath, ['server/index.mjs'], { stdio: 'inherit', env }),
  spawn('npm', ['run', 'dev'], { stdio: 'inherit', env }),
]

const stop = (code = 0) => {
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM')
  })
  process.exit(code)
}

children.forEach((child) => {
  child.on('exit', (code) => {
    if (code && code !== 0) stop(code)
  })
})

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
