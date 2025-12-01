import { defineConfig, configDefaults } from "vitest/config";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { redwood } from "rwsdk/vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    const isTest = mode === "test" || !!process.env.VITEST;

    return {
        environments: {
            ssr: {},
        },

        plugins: [
            tailwindcss(),
            react({
                babel: {
                    plugins: ["babel-plugin-react-compiler"],
                },
            }),
            // DO NOT use cloudflare/rwsdk when we do testing
            // i am honestly unsure if this is the way, but it works.
            !isTest &&
                cloudflare({
                    viteEnvironment: { name: "worker" },
                }),
            !isTest && redwood(),
        ].filter(Boolean),

        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
            },
        },

        server: {
            host: "0.0.0.0",
            port: 5173,
            strictPort: true,
            hmr: {
                port: 5173,
            },
            watch: {
                usePolling: true,
                interval: 1000,
            },
        },

        test: {
            environment: "jsdom",
            globals: true,
            setupFiles: "./src/__tests__/setupTests.ts",
        },
    };
});
