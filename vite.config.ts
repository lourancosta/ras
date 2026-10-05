import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // `npm run dev:phone` (mode "phone"): serve over HTTPS on the local network so the
    // app can be tested on a phone. HTTPS is needed because browsers only allow some
    // APIs (e.g. crypto.randomUUID, used for photo names) on secure pages.
    // The certificate is self-signed, so the phone shows a warning the first time.
    mode === 'phone' && basicSsl(),
  ],
}))
