import type { ParkingSlotState } from '../models/parking'

const apiUrlStorageKey = 'park-api-base-url'
const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.29.52:5175'

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, '')
}

export function getApiBaseUrl() {
  const savedUrl = localStorage.getItem(apiUrlStorageKey)
  if (!savedUrl || savedUrl === 'http://localhost:5175') return normalizeApiBaseUrl(defaultApiBaseUrl)
  return normalizeApiBaseUrl(savedUrl)
}

export function setApiBaseUrl(value: string) {
  const normalizedUrl = normalizeApiBaseUrl(value)
  localStorage.setItem(apiUrlStorageKey, normalizedUrl)
  window.dispatchEvent(new Event('park-api-url-changed'))
  return normalizedUrl
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return response.json() as Promise<T>
}

export const parkingApi = {
  getParkingSlots: () => request<ParkingSlotState[]>('/api/parking/slots'),
  getParkingSlot: (slotId: number) => request<ParkingSlotState>(`/api/parking/slots/${slotId}`),
  checkHealth: async () => {
    const response = await fetch(`${getApiBaseUrl()}/health`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  },
}
