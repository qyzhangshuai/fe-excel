import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    // 改成相对路径
    base: './',
    // 输出目录为docs
    build: {
        outDir: './docs'
    },
    plugins: [vue(), vueJsx()],
})
