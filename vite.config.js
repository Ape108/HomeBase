import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from 'vite'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID),
    'process.env.GOOGLE_API_KEY': JSON.stringify(process.env.GOOGLE_API_KEY),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}) 