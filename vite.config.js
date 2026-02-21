import { defineConfig } from 'vite'
import license from 'rollup-plugin-license'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    build: {
        target: 'es2015',
        outDir: 'dist',
        assetsDir: '.', // Put assets in root of dist
        rollupOptions: {
            output: {
                format: 'iife',
                entryFileNames: 'editor.bundle.js',
                assetFileNames: 'editor.bundle.[ext]', // in case of css
            },
            plugins: [
                license({
                    sourcemap: false,
                    cwd: process.cwd(),

                    // 1. 在 editor.bundle.js 顶部插入版权声明头
                    banner: {
                        commentStyle: 'regular',
                        content: `
                          Editor Bundle
                          Generated on <%= moment().format('YYYY-MM-DD') %>
                          
                          This bundle contains software from multiple open-source projects, 
                          including CodeMirror, which is licensed under the MIT License.
                          Full dependency license details can be found in THIRD_PARTY_NOTICES.txt.
                        `,
                    },

                    // 2. 自动扫描所有依赖的 LICENSE 文件并汇总输出到一个 txt 文件中
                    thirdParty: {
                        output: {
                            file: path.join(__dirname, 'dist', 'THIRD_PARTY_NOTICES.txt'),
                            encoding: 'utf-8',
                        },
                        includePrivate: false,
                    },
                })
            ]
        }
    }
})
