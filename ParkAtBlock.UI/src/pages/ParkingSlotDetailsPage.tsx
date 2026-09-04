import { ArrowLeft, Car, CircleParking, Clock3, Cpu, Ruler, Radio } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useParking } from '../context/ParkingContext'
import { formatDate } from '../utils/dateUtils'

export function ParkingSlotDetailsPage() {
  const { slotId } = useParams()
  const { slots } = useParking()
  const slot = slots.find((item) => item.slotId === Number(slotId))
  if (!slot) return <section className="page"><Link className="back-link" to="/dashboard"><ArrowLeft size={17} /> Back to overview</Link><div className="empty-state"><h3>Slot not found</h3><p>This slot is not currently known by the parking service.</p></div></section>
  const offline = slot.deviceStatus === 'Offline'
  const status = offline ? 'Offline' : slot.isOccupied ? 'Occupied' : 'Available'
  const Icon = offline ? Radio : slot.isOccupied ? Car : CircleParking
  return <section className="page details-page"><Link className="back-link" to="/dashboard"><ArrowLeft size={17} /> Back to overview</Link><div className="detail-hero"><div><p className="eyebrow">Parking space</p><h1>Slot {String(slot.slotId).padStart(2, '0')}</h1></div><div className={`detail-status status-${status.toLowerCase()}`}><Icon size={23} /><span>{status}</span></div></div><div className="details-panel"><div className="detail-reading"><span>Current distance</span><strong>{slot.distanceCm.toFixed(1)} <small>cm</small></strong><p>Measured by the ultrasonic sensor</p></div><div className="detail-list"><div><Cpu size={18} /><span>Device</span><b>{slot.deviceId}</b></div><div><Radio size={18} /><span>Device status</span><b>{slot.deviceStatus}</b></div><div><Clock3 size={18} /><span>Last seen</span><b>{formatDate(slot.lastSeenUtc)}</b></div><div><Ruler size={18} /><span>Last updated</span><b>{formatDate(slot.lastUpdatedUtc)}</b></div></div></div></section>
}
