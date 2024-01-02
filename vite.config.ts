/** @type {import('vite').UserConfig} */
export default {
    root: "./public",
    build: {
        outDir: "./dist",
        rollupOptions: {
            output: {
              entryFileNames: `[name].js`,
              chunkFileNames: `[name].js`,
              assetFileNames: `[name].[ext]`
            }
          }
    }
    
}