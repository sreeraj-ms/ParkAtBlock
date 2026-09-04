import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ParkingSlotCard } from '../components/ParkingSlotCard'
import { ParkingSummary } from '../components/ParkingSummary'
import { useParking } from '../context/ParkingContext'

type Filter = 'All' | 'Available' | 'Occupied' | 'Offline'
type Sort = 'slot' | 'available' | 'occupied' | 'offline'

export function DashboardPage() {
  const { slots, loading, error, loadSlots } = useParking()
  const [filter, setFilter] = useState<Filter>('All')
  const [sort, setSort] = useState<Sort>('slot')
  const [search, setSearch] = useState('')
  const filteredSlots = useMemo(() => slots.filter((slot) => {
    const status = slot.deviceStatus === 'Offline' ? 'Offline' : slot.isOccupied ? 'Occupied' : 'Available'
    return (filter === 'All' || status === filter) && (`${slot.slotId}`.includes(search) || slot.deviceId.toLowerCase().includes(search.toLowerCase()))
  }).sort((a, b) => sort === 'slot' ? a.slotId - b.slotId : sort === 'available' ? Number(a.isOccupied) - Number(b.isOccupied) : sort === 'occupied' ? Number(b.isOccupied) - Number(a.isOccupied) : Number(b.deviceStatus === 'Offline') - Number(a.deviceStatus === 'Offline')), [slots, filter, sort, search])

  return <section className="page"><div className="page-heading"><div><p className="eyebrow">Live operations</p><h1>Parking overview</h1><p className="page-intro">A live view of every monitored space.</p></div><span className="last-sync">Updates stream live</span></div><ParkingSummary slots={slots} />{error && <div className="alert" role="alert"><span>{error}</span><button onClick={() => void loadSlots()}>Retry</button></div>}<div className="section-heading"><div><h2>Parking slots</h2><span>{filteredSlots.length} of {slots.length} spaces</span></div><div className="slot-controls"><label className="search-box"><Search size={17} aria-hidden="true" /><span className="sr-only">Search slots or devices</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slot or device" /></label><label className="sort-box"><SlidersHorizontal size={16} aria-hidden="true" /><span className="sr-only">Sort slots</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="slot">Slot number</option><option value="available">Available first</option><option value="occupied">Occupied first</option><option value="offline">Offline first</option></select></label></div></div><div className="filters" role="tablist" aria-label="Filter parking slots">{(['All', 'Available', 'Occupied', 'Offline'] as Filter[]).map((option) => <button className={filter === option ? 'active' : ''} key={option} onClick={() => setFilter(option)} role="tab" aria-selected={filter === option}>{option}</button>)}</div>{loading ? <div className="slot-grid">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item}><span /><span /><span /></div>)}</div> : filteredSlots.length ? <div className="slot-grid">{filteredSlots.map((slot) => <ParkingSlotCard slot={slot} key={slot.slotId} />)}</div> : <div className="empty-state"><div>⌁</div><h3>No parking slots available</h3><p>Connect a sensor to see its live state here.</p></div>}</section>
}
