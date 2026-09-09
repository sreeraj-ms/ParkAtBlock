import { parkingApi } from './parkingApi'

export type NotificationPermissionState = NotificationPermission | 'unsupported'

export function getNotificationPermission(): NotificationPermissionState {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
}

function decodeVapidKey(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

export async function subscribeToPush() {
  const { publicKey } = await parkingApi.getPushPublicKey()
  if (!publicKey) throw new Error('Push notifications are not configured on the server.')

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidKey(publicKey),
  })
  await parkingApi.savePushSubscription(subscription.toJSON())
}

export async function showTestNotification() {
  if (getNotificationPermission() !== 'granted') return
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification('ParkAtBlock notifications enabled', {
    body: 'You will be notified when a parking slot becomes available.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'parking-notification-test',
  })
}

export async function notifyParkingAvailable(slotId: number) {
  if (getNotificationPermission() !== 'granted') return

  const title = 'Parking available'
  const options: NotificationOptions = {
    body: `Parking slot ${slotId} is now available.`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `parking-slot-${slotId}`,
  }

  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) {
    await registration.showNotification(title, options)
  } else {
    new Notification(title, options)
  }
}