import { Bell, CheckCircle2, LoaderCircle, Moon, Save, Server, Sun, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getApiBaseUrl, parkingApi, setApiBaseUrl } from '../services/parkingApi'
import { getNotificationPermission, requestNotificationPermission, showTestNotification, subscribeToPush, type NotificationPermissionState } from '../services/notificationService'

export function SettingsPage() {
  const [dark, setDark] = useState(() => localStorage.getItem('park-theme') === 'dark')
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl)
  const [health, setHealth] = useState<'idle' | 'checking' | 'healthy' | 'unhealthy'>('idle')
  const [healthMessage, setHealthMessage] = useState('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(getNotificationPermission)
  const [notificationMessage, setNotificationMessage] = useState('')
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('park-theme', dark ? 'dark' : 'light') }, [dark])
  const checkHealth = async () => {
    setHealth('checking')
    setHealthMessage('Checking connection...')
    try {
      await parkingApi.checkHealth()
      setHealth('healthy')
      setHealthMessage('API is reachable')
    } catch {
      setHealth('unhealthy')
      setHealthMessage('Unable to reach API')
    }
  }
  const saveApiUrl = () => {
    setApiUrl(setApiBaseUrl(apiUrl))
    void checkHealth()
  }
  const enableNotifications = async () => {
    setNotificationMessage('')
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)
    if (permission !== 'granted') return
    try {
      await subscribeToPush()
      await showTestNotification()
      setNotificationMessage('Test notification sent. Push notifications are enabled.')
    } catch (error) {
      setNotificationMessage(error instanceof Error ? error.message : 'Unable to configure push notifications.')
    }
  }
  return <section className="page settings-page"><div className="page-heading"><div><p className="eyebrow">Workspace preferences</p><h1>Settings</h1><p className="page-intro">Tune the dashboard experience for your team.</p></div></div><div className="settings-list"><div className="setting-row"><div className="setting-icon"><Sun size={19} /></div><div><strong>Appearance</strong><span>Choose how the dashboard looks</span></div><button className="theme-toggle" onClick={() => setDark(!dark)} aria-pressed={dark}><Sun size={16} /><span>{dark ? 'Dark' : 'Light'}</span><Moon size={16} /></button></div><div className="setting-row"><div className="setting-icon"><Bell size={19} /></div><div><strong>Parking notifications</strong><span>{notificationMessage || (notificationPermission === 'granted' ? 'You will be notified when a slot becomes available' : notificationPermission === 'unsupported' ? 'Install the app and use HTTPS to enable mobile notifications' : 'Get notified when a parking slot becomes available')}</span></div><button className="health-check" onClick={() => void enableNotifications()} disabled={notificationPermission === 'unsupported' || notificationPermission === 'denied'}>{notificationPermission === 'granted' ? <CheckCircle2 size={15} /> : <Bell size={15} />} {notificationPermission === 'unsupported' ? 'Unavailable' : notificationPermission === 'granted' ? 'Test again' : notificationPermission === 'denied' ? 'Blocked' : 'Enable'}</button></div><div className="setting-row api-setting"><div className="setting-icon"><Server size={19} /></div><div><strong>API connection</strong><span>Set the address used by the dashboard and live updates</span></div><div className="api-editor"><label><span className="sr-only">API base URL</span><input value={apiUrl} onChange={(event) => { setApiUrl(event.target.value); setHealth('idle') }} placeholder="http://192.168.29.52:5175" /></label><button className="api-save" onClick={saveApiUrl} disabled={!apiUrl.trim() || health === 'checking'}><Save size={15} /> Save</button><button className="health-check" onClick={() => void checkHealth()} disabled={health === 'checking'}>{health === 'checking' ? <LoaderCircle size={15} className="health-spinner" /> : health === 'healthy' ? <CheckCircle2 size={15} /> : health === 'unhealthy' ? <XCircle size={15} /> : <Server size={15} />} Check health</button><span className={`health-status health-${health}`}>{healthMessage}</span></div></div></div></section>
}
