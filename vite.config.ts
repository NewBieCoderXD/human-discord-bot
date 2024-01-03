/** @type {import('vite').UserConfig} */
export default {
  build: {
    emptyOutDir: false,
    outDir: "./public",
    rollupOptions: {
      input:["./src/client/public/script.ts"],
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
}