import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://sakbol.app",
  output: "static",
  build: {
    inlineStylesheets: "always",
  },
});
