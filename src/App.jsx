import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Hero from './components/Hero'
import SandboxPage from './pages/SandboxPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <Hero />
          </AppLayout>
        } />
        <Route path="/sandbox" element={<SandboxPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
