import type { ParkingSlotState } from '../models/parking'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/$/, '')

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return response.json() as Promise<T>
}

export const parkingApi = {
  getParkingSlots: () => request<ParkingSlotState[]>('/api/parking/slots'),
  getParkingSlot: (slotId: number) => request<ParkingSlotState>(`/api/parking/slots/${slotId}`),
}

export { apiBaseUrl }
