import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], server:{watch:{ignored:['**/public/duckdb/**','**/public/data/**']},proxy:{'/api':{target:'http://127.0.0.1:8787',changeOrigin:false}}}, worker: { format: 'es' }, build: { chunkSizeWarningLimit: 2500 } });
