import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/layouts/site-layout'
import { AboutPage } from '@/pages/about-page'
import { BackgroundsPage } from '@/pages/backgrounds-page'
import { HomePage } from '@/pages/home-page'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="backgrounds" element={<BackgroundsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  )
}
