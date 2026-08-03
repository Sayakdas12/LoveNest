import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ── ANSI palette ─────────────────────────────────────────────────────────────
const R      = '\x1b[0m'
const B      = '\x1b[1m'
const DIM    = '\x1b[2m'
const IT     = '\x1b[3m'
const WHITE  = '\x1b[97m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const PINK   = '\x1b[38;5;213m'   // bright pink
const ROSE   = '\x1b[38;5;204m'   // hot rose
const LAVEN  = '\x1b[38;5;183m'   // lavender
const GOLD   = '\x1b[38;5;220m'   // gold
const TEAL   = '\x1b[38;5;87m'    // neon teal
const LIME   = '\x1b[38;5;119m'   // lime green
const ORANGE = '\x1b[38;5;214m'   // orange
const GRAPE  = '\x1b[38;5;141m'   // grape / purple
const SKY    = '\x1b[38;5;117m'   // sky blue

// ── Helpers ───────────────────────────────────────────────────────────────────
function row(icon, label, value, valueColor = TEAL) {
  const pad = ' '.repeat(Math.max(0, 13 - label.length))
  return `  ${icon}  ${B}${WHITE}${label}${R}${pad}${valueColor}${value}${R}`
}
function sep(char = '─', len = 58, color = GRAPE) {
  return `  ${color}${char.repeat(len)}${R}`
}
function greeting() {
  const h = new Date().getHours()
  if (h < 6)  return '🌙  Burning the midnight oil, Sayak...'
  if (h < 12) return '🌅  Good morning, Sayak!'
  if (h < 17) return '☀️   Good afternoon, Sayak!'
  if (h < 21) return '🌆  Good evening, Sayak!'
  return '🌃  Late-night grind mode, Sayak!'
}

function lovenestBanner() {
  return {
    name: 'lovenest-banner',
    configureServer(server) {
      server.printUrls = () => {
        const now     = new Date()
        const timeStr = now.toLocaleString('en-IN', {
          hour12: true, weekday: 'short', year: 'numeric',
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })

        // ── 3-D ASCII LOGO ────────────────────────────────────────────────────
        console.log()
        console.log(`  ${PINK}${B}╔══════════════════════════════════════════════════════════╗${R}`)
        console.log(`  ${PINK}${B}║${R}  ${ROSE}${B}██╗      ██████╗ ██╗   ██╗███████╗${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${ROSE}${B}██║     ██╔═══██╗██║   ██║██╔════╝${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${PINK}${B}██║     ██║   ██║██║   ██║█████╗  ${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${LAVEN}${B}██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}███████╗╚██████╔╝ ╚████╔╝ ███████╗${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}                                                          ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${TEAL}${B}███╗   ██╗███████╗███████╗████████╗${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${TEAL}${B}████╗  ██║██╔════╝██╔════╝╚══██╔══╝${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${CYAN}${B}██╔██╗ ██║█████╗  ███████╗   ██║   ${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${LAVEN}${B}██║╚██╗██║██╔══╝  ╚════██║   ██║   ${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}██║ ╚████║███████╗███████║   ██║   ${R}                    ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝   ${R}                   ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}                                                          ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}║${R}      ${GOLD}${B}✦  React 19  ·  Vite 7  ·  TailwindCSS  ✦${R}      ${PINK}${B}║${R}`)
        console.log(`  ${PINK}${B}╚══════════════════════════════════════════════════════════╝${R}`)
        console.log()

        // ── Greeting ──────────────────────────────────────────────────────────
        console.log(`  ${GOLD}${B}${IT}  ${greeting()}${R}`)
        console.log()

        // ── Separator ─────────────────────────────────────────────────────────
        console.log(sep('▰', 58, ROSE))
        console.log()

        // ── Service rows ──────────────────────────────────────────────────────
        console.log(row('🚀', 'Local',      'http://localhost:5173/',  TEAL))
        console.log(row('🔌', 'API Proxy',  'http://localhost:3000',   SKY))
        console.log(row('⚡', 'HMR',        'Hot Module Replacement active', LIME))
        console.log(row('🎨', 'TailwindCSS','v4 + DaisyUI v5 ready',  PINK))
        console.log(row('🗃 ', 'Redux',      'State management active', LAVEN))
        console.log(row('🔷', 'Apollo',     'GraphQL client active',   CYAN))
        console.log(row('🔥', 'Firebase',   'Auth SDK initialised',    ORANGE))
        console.log(row('📹', 'LiveKit',    'Video calls ready',       GRAPE))
        console.log(row('😊', 'face-api',   'Face recognition loaded', ROSE))
        console.log()

        // ── Separator ─────────────────────────────────────────────────────────
        console.log(sep('▰', 58, GRAPE))
        console.log()

        // ── Meta rows ─────────────────────────────────────────────────────────
        console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}Framework  ${R}   ${DIM}React 19 + Vite 7${R}`)
        console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}Styling    ${R}   ${DIM}TailwindCSS v4 + DaisyUI v5${R}`)
        console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}State      ${R}   ${DIM}Redux Toolkit + Apollo Client${R}`)
        console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}Started    ${R}   ${DIM}${timeStr}${R}`)
        console.log()

        // ── Footer ────────────────────────────────────────────────────────────
        console.log(`  ${ROSE}${B}${'❤'.repeat(3)}${R}  ${PINK}${DIM}Built with love · LoveNest v1.0${R}  ${ROSE}${B}${'❤'.repeat(3)}${R}`)
        console.log()
        console.log(sep('═', 58, PINK))
        console.log()
        console.log(`  ${DIM}  ➜  press ${R}${B}h${R}${DIM} + enter to show Vite help${R}`)
        console.log()
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), lovenestBanner()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
