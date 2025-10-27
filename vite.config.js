import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                college: resolve(__dirname, 'pages/college/college.html'),
                contact: resolve(__dirname, 'pages/contact/contact.html'),
                design: resolve(__dirname, 'pages/design/design.html'),
                fonts: resolve(__dirname, 'pages/fonts/fonts.html'),
                life: resolve(__dirname, 'pages/life/life.html'),
                works: resolve(__dirname, 'pages/works/works.html'),
            },
        },
    },
});