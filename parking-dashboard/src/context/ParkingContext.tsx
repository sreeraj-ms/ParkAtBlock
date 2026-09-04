import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ConnectionStatus, ParkingSlotState } from '../models/parking'
import { parkingApi } from '../services/parkingApi'
import { createSignalRService } from '../services/signalRService'

interface ParkingContextValue {
  slots: ParkingSlotState[]
  connectionStatus: ConnectionStatus
  loading: boolean
  error: string | null
  loadSlots: () => Promise<void>
}

const ParkingContext = createContext<ParkingContextValue | undefined>(undefined)

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<ParkingSlotState[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSlots = async () => {
    setError(null)
    try {
      const nextSlots = await parkingApi.getParkingSlots()
      setSlots(nextSlots)
    } catch {
      setError('Unable to reach the parking service. Check the API connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSlots()
    const signalR = createSignalRService(
      (updatedSlot) => setSlots((current) => {
        const exists = current.some((slot) => slot.slotId === updatedSlot.slotId)
        return exists ? current.map((slot) => slot.slotId === updatedSlot.slotId ? updatedSlot : slot) : [...current, updatedSlot]
      }),
      setConnectionStatus,
      () => void loadSlots(),
    )
    void signalR.start()
    return () => { void signalR.stop() }
  }, [])

  const value = useMemo(() => ({ slots, connectionStatus, loading, error, loadSlots }), [slots, connectionStatus, loading, error])
  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>
}

export function useParking() {
  const context = useContext(ParkingContext)
  if (!context) throw new Error('useParking must be used inside ParkingProvider')
  return context
}
