import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { NotFound, Home } from './imports'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router
