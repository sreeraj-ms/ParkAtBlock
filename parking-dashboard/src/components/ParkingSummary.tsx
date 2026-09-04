import { Car, CircleParking, LayoutGrid, Radio } from 'lucide-react'
import type { ParkingSlotState } from '../models/parking'

export function ParkingSummary({ slots }: { slots: ParkingSlotState[] }) {
  const available = slots.filter((slot) => slot.deviceStatus === 'Online' && !slot.isOccupied).length
  const occupied = slots.filter((slot) => slot.deviceStatus === 'Online' && slot.isOccupied).length
  const offline = slots.filter((slot) => slot.deviceStatus === 'Offline').length
  const stats = [
    { label: 'Total slots', value: slots.length, icon: LayoutGrid, tone: 'neutral' },
    { label: 'Available', value: available, icon: CircleParking, tone: 'green' },
    { label: 'Occupied', value: occupied, icon: Car, tone: 'orange' },
    { label: 'Offline', value: offline, icon: Radio, tone: 'red' },
  ]
  return <div className="summary-grid">{stats.map(({ label, value, icon: Icon, tone }) => <div className={`summary-card tone-${tone}`} key={label}><Icon size={19} aria-hidden="true" /><div><strong>{value}</strong><span>{label}</span></div></div>)}</div>
}
