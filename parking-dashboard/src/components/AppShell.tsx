import { BarChart3, CircleParking, Settings, Zap } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useParking } from '../context/ParkingContext'
import { ConnectionStatus } from './ConnectionStatus'

export function AppShell() {
  const { connectionStatus } = useParking()
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span>Park<span>At</span>Block</span></div><p className="sidebar-label">Workspace</p><nav><NavLink to="/dashboard"><BarChart3 size={18} /> Overview</NavLink><NavLink to="/dashboard"><CircleParking size={18} /> Parking slots</NavLink><NavLink to="/settings"><Settings size={18} /> Settings</NavLink></nav><div className="sidebar-footer"><ConnectionStatus status={connectionStatus} /><span>Sensor network</span></div></aside><main className="main-content"><header className="mobile-header"><div className="brand"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span><span>Park<span>At</span>Block</span></div><ConnectionStatus status={connectionStatus} /></header><Outlet /></main><nav className="bottom-nav"><NavLink to="/dashboard"><BarChart3 size={19} /><span>Overview</span></NavLink><NavLink to="/dashboard"><CircleParking size={19} /><span>Parking</span></NavLink><NavLink to="/settings"><Settings size={19} /><span>Settings</span></NavLink></nav></div>
}
