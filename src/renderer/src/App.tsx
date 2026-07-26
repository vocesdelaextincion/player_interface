import { PlaybackProvider } from './state/PlaybackContext'
import { AppShell } from './state/AppShell'

function App(): React.JSX.Element {
  return (
    <PlaybackProvider>
      <AppShell />
    </PlaybackProvider>
  )
}

export default App
