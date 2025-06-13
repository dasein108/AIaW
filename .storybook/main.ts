import type { StorybookConfig } from "@storybook/vue3-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

const config: StorybookConfig = {
  stories: ["./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
     "@storybook/addon-essentials",
    /*"@storybook/addon-onboarding",
    "@chromatic-com/storybook", */
    "@storybook/experimental-addon-test"
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  logLevel: "debug",
  async viteFinal(config) {
    const { default: UnoCSS } = await import('unocss/vite');

    return mergeConfig(config, {
      plugins: [
        vue({
          template: { transformAssetUrls },
        }),
        quasar({
          sassVariables: "src/css/quasar.variables.scss",
        }),
        UnoCSS(),
      ],
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("../src", import.meta.url)),
          "@shared": fileURLToPath(new URL("../src/shared", import.meta.url)),
          "@features": fileURLToPath(new URL("../src/features", import.meta.url)),
          "@services": fileURLToPath(new URL("../src/services", import.meta.url)),
          src: fileURLToPath(new URL("../src", import.meta.url)),
          layouts: fileURLToPath(new URL("../src/layouts", import.meta.url)),
          pages: fileURLToPath(new URL("../src/pages", import.meta.url)),
          "src/services/supabase/client": fileURLToPath(new URL("../.storybook/mocks/supabase-client.ts", import.meta.url)),
          "@/services/supabase/types": fileURLToPath(new URL("../.storybook/mocks/supabase-types.ts", import.meta.url)),
          "@/services/supabase/userProvider": fileURLToPath(new URL("../.storybook/mocks/supabase-userProvider.ts", import.meta.url)),
          "src/components/social/composable/useChats": fileURLToPath(new URL("../.storybook/mocks/useChats.ts", import.meta.url)),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
      },
      define: {
        "process.env": {
          MAX_MESSAGE_FILE_SIZE_MB: "20",
          DOC_PARSE_BASE_URL: "",
          CORS_FETCH_BASE_URL: "",
          SYNC_SERVICE_PRICE: "0",
          SYNC_SERVICE_PRICE_USD: "0",
          USD_TO_CNY_RATE: "7.0",
          STRIPE_FEE: "0",
          DEXIE_DB_URL: "",
          LITELLM_BASE_URL: "",
          BUDGET_BASE_URL: "",
          SEARXNG_BASE_URL: "",
          SUPABASE_URL: "https://mock-supabase-url.supabase.co",
          SUPABASE_KEY: "mock-supabase-key",
        },
      },
    });
  },
};

export default config;
