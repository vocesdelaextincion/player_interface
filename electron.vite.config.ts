import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

// Electron 22 is the last release that runs on Windows 8/8.1/7 (see README "Target machine").
// It bundles Chromium 108 and Node 16, and Vite 7 targets newer browsers by default — without
// these explicit targets the build emits syntax the kiosk's runtime can't parse, and you get a
// blank window with no error.
const CHROME_TARGET = 'chrome108'
const NODE_TARGET = 'node16'

export default defineConfig({
  main: {
    build: { target: NODE_TARGET }
  },
  preload: {
    build: { target: NODE_TARGET }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    build: { target: CHROME_TARGET },
    plugins: [react()]
  }
})
