import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Edit this:
const repoName = 'reaction-app' // <-- your repo name

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})