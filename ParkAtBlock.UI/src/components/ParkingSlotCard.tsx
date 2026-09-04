import { ArrowUpRight, Car, CircleParking, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ParkingSlotState } from '../models/parking'
import { formatRelativeTime } from '../utils/dateUtils'

export function ParkingSlotCard({ slot }: { slot: ParkingSlotState }) {
  const offline = slot.deviceStatus === 'Offline'
  const status = offline ? 'Offline' : slot.isOccupied ? 'Occupied' : 'Available'
  const Icon = offline ? Radio : slot.isOccupied ? Car : CircleParking
  return <Link className={`slot-card status-${status.toLowerCase()}`} to={`/parking/${slot.slotId}`} aria-label={`View details for parking slot ${slot.slotId}`}>
    <div className="slot-card-top"><span className="slot-number">Slot {String(slot.slotId).padStart(2, '0')}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
    <div className="slot-state"><span className="state-icon"><Icon size={22} aria-hidden="true" /></span><strong>{status}</strong></div>
    <div className="slot-meta"><span>{slot.deviceId}</span><span className="device-status"><i /> {slot.deviceStatus}</span></div>
    <div className="slot-updated">Updated {formatRelativeTime(slot.lastUpdatedUtc)}</div>
  </Link>
}
