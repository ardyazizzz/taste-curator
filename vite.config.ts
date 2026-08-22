import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset URLs let the production preview open directly from dist/index.html.
export default defineConfig({ base: './', plugins: [react()] })
