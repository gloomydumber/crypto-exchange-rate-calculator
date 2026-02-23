import { ExchangeCalc } from './components/ExchangeCalc'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a' }}>
      <div style={{ width: 420, height: 320 }}>
        <ExchangeCalc height="100%" />
      </div>
    </div>
  )
}

export default App
