import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function lovenestBanner() {
  return {
    name: 'lovenest-banner',
    configureServer(server) {
      const _print = server.printUrls.bind(server)
      server.printUrls = () => {
        const RESET   = '\x1b[0m'
        const BOLD    = '\x1b[1m'
        const CYAN    = '\x1b[36m'
        const GREEN   = '\x1b[32m'
        const YELLOW  = '\x1b[33m'
        const DIM     = '\x1b[2m'
        console.log()
        console.log(`${CYAN}${BOLD}  ╔${"-".repeat(46)}╗${RESET}`)
        console.log(`${CYAN}${BOLD}  |  💞  LoveNest  —  React  +  Vite  Dev     |${RESET}`)
        console.log(`${CYAN}${BOLD}  ╚${"-".repeat(46)}╝${RESET}`)
        console.log()
        console.log(`  ${GREEN}${BOLD}🚀  Local      ${RESET}${CYAN}http://localhost:5173/${RESET}`)
        console.log(`  ${GREEN}${BOLD}🔌  API Proxy  ${RESET}${DIM}http://localhost:3000${RESET}`)
        console.log(`  ${GREEN}${BOLD}⚡  HMR        ${RESET}${DIM}Hot Module Replacement active${RESET}`)
        console.log(`  ${GREEN}${BOLD}🎨  TailwindCSS${RESET}${DIM}+ DaisyUI ready${RESET}`)
        console.log(`  ${GREEN}${BOLD}🗃  Redux       ${RESET}${DIM}State management active${RESET}`)
        console.log()
        console.log(`  ${YELLOW}●  Framework   ${RESET}${DIM}React 19 + Vite 7${RESET}`)
        console.log(`  ${YELLOW}●  Time        ${RESET}${DIM}${new Date().toLocaleString()}${RESET}`)
        console.log()
        console.log(`  ${CYAN}${DIM}${"─".repeat(46)}${RESET}`)
        console.log()
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), lovenestBanner()],
})
