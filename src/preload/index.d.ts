import { ElectronAPI } from '@electron-toolkit/preload'

interface AdminAPI {
  quitApp: () => void
  restartApp: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AdminAPI
  }
}
