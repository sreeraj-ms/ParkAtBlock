export type NotificationPermissionState = NotificationPermission | 'unsupported'

export function getNotificationPermission(): NotificationPermissionState {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.requestPermission()
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