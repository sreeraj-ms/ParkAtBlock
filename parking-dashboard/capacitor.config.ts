import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.parkatblock.dashboard',
  appName: 'ParkAtBlock',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
