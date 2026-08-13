import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: true,
    port: 5173,
    // Dev-only: lets a tunnel host reach the dev server. Has no effect on builds.
    allowedHosts: ['tricky-memorisingly-arjun.ngrok-free.dev'],
  },
  plugins: [react(),
    basicSsl()
  ],
  build: {
    rollupOptions: {
      output: {
        // The whole app used to ship as one ~900 kB chunk. Splitting the two
        // big vendors out means a repeat visitor re-downloads only app code
        // when it changes — worth real seconds on a mobile connection.
        manualChunks: {
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
