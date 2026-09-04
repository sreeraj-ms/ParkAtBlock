import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import type { ConnectionStatus, ParkingSlotState } from '../models/parking'
import { apiBaseUrl } from './parkingApi'

export function createSignalRService(
  onSlotUpdated: (slot: ParkingSlotState) => void,
  onStatusChanged: (status: ConnectionStatus) => void,
  onReconnected: () => void,
) {
  const connection = new HubConnectionBuilder()
    .withUrl(`${apiBaseUrl}/hubs/parking`)
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('ParkingSlotUpdated', onSlotUpdated)
  connection.onreconnecting(() => onStatusChanged('Reconnecting'))
  connection.onreconnected(() => {
    onStatusChanged('Connected')
    onReconnected()
  })
  connection.onclose(() => onStatusChanged('Disconnected'))

  return {
    start: async () => {
      if (connection.state === HubConnectionState.Disconnected) {
        onStatusChanged('Reconnecting')
        try {
          await connection.start()
          onStatusChanged('Connected')
        } catch {
          onStatusChanged('Disconnected')
        }
      }
    },
    stop: () => connection.stop(),
  }
}
