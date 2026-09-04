import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ParkingProvider } from './context/ParkingContext'
import { DashboardPage } from './pages/DashboardPage'
import { ParkingSlotDetailsPage } from './pages/ParkingSlotDetailsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return <ParkingProvider><Routes><Route element={<AppShell />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/parking/:slotId" element={<ParkingSlotDetailsPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Route></Routes></ParkingProvider>
}
