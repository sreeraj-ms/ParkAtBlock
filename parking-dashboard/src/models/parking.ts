export type DeviceStatus = 'Online' | 'Offline'
export type ConnectionStatus = 'Connected' | 'Reconnecting' | 'Disconnected'

export interface ParkingSlotState {
  slotId: number
  deviceId: string
  distanceCm: number
  isOccupied: boolean
  lastUpdatedUtc: string
  lastSeenUtc: string
  deviceStatus: DeviceStatus
}
