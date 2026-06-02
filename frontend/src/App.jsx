import { Routes, Route } from 'react-router-dom'
import Install from './pages/Install'
import Products from './pages/Products'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Install />} />
      <Route path="/products" element={<Products />} />
    </Routes>
  )
}

export default App