import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import type { ConnectionStatus as Status } from '../models/parking'

export function ConnectionStatus({ status }: { status: Status }) {
  const content = status === 'Connected' ? 'Live' : status === 'Reconnecting' ? 'Reconnecting' : 'Offline'
  const Icon = status === 'Connected' ? Wifi : status === 'Reconnecting' ? RefreshCw : WifiOff
  return <span className={`connection connection-${status.toLowerCase()}`}><Icon size={15} aria-hidden="true" /> {content}</span>
}
