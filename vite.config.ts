// @lovable.dev/vite-tanstack-config already includes the following - do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this - wrangler.jsonc main alone is insufficient.
export default defineConfig({
  // Force the Nitro Cloudflare build outside Lovable. Without this, local/CI builds
  // only emit a Vite SSR bundle and Wrangler may try to bundle src/server.ts
  // directly, which cannot resolve TanStack Start virtual modules.
  nitro: {
    preset: "cloudflare-module",
    cloudflare: {
      nodeCompat: true,
      deployConfig: false,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
