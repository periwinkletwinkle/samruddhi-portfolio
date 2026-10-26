import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/layouts/site-layout'
import { AboutPage } from '@/pages/about-page'
import { HomePage } from '@/pages/home-page'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="backgrounds" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
