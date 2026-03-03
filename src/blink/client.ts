import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'grand-theft-bike-kd5wighw',
  auth: { mode: 'managed' }
})
