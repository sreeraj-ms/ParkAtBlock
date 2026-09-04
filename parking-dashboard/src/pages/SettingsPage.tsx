import { Moon, Server, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SettingsPage() {
  const [dark, setDark] = useState(() => localStorage.getItem('park-theme') === 'dark')
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('park-theme', dark ? 'dark' : 'light') }, [dark])
  return <section className="page settings-page"><div className="page-heading"><div><p className="eyebrow">Workspace preferences</p><h1>Settings</h1><p className="page-intro">Tune the dashboard experience for your team.</p></div></div><div className="settings-list"><div className="setting-row"><div className="setting-icon"><Sun size={19} /></div><div><strong>Appearance</strong><span>Choose how the dashboard looks</span></div><button className="theme-toggle" onClick={() => setDark(!dark)} aria-pressed={dark}><Sun size={16} /><span>{dark ? 'Dark' : 'Light'}</span><Moon size={16} /></button></div><div className="setting-row"><div className="setting-icon"><Server size={19} /></div><div><strong>API connection</strong><span>Live data source</span></div><code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175'}</code></div></div></section>
}
