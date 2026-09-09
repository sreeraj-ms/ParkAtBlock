import type { ParkingSlotState } from '../models/parking'

const apiUrlStorageKey = 'park-api-base-url'
const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://park-at-block-api.vercel.app'

export interface PushSubscriptionResponse {
  publicKey: string | null
}

function normalizeApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, '')
}

export function getApiBaseUrl() {
  const savedUrl = localStorage.getItem(apiUrlStorageKey)
  return normalizeApiBaseUrl(savedUrl || defaultApiBaseUrl)
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

async function send<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export const parkingApi = {
  getParkingSlots: () => request<ParkingSlotState[]>('/api/parking/slots'),
  getParkingSlot: (slotId: number) => request<ParkingSlotState>(`/api/parking/slots/${slotId}`),
  getPushPublicKey: () => request<PushSubscriptionResponse>('/api/push/public-key'),
  savePushSubscription: (subscription: PushSubscriptionJSON) => send<void>('/api/push/subscriptions', subscription),
  checkHealth: async () => {
    const response = await fetch(`${getApiBaseUrl()}/health`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  },
}
