import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
  accountId: "1b0e170f266ac100b20bd9c4695b0a2d",
  worker: {
    name: "lukaszszukalski-strony",
    entrypoint: "./src/worker.mjs",
    compatibilityDate: "2026-11-18",
    env: {
      ASSETS: bindings.assets(),
    },
    assets: {
      htmlHandling: "force-trailing-slash",
      notFoundHandling: "none",
      runWorkerFirst: true,
    },
    workersDev: false,
    previewUrls: false,
    triggers: [
      triggers.fetch({
        pattern: "lukaszszukalski.pl/basket*",
        zone: "lukaszszukalski.pl",
      }),
      triggers.fetch({
        pattern: "lukaszszukalski.pl/rekomendacje*",
        zone: "lukaszszukalski.pl",
      }),
      triggers.fetch({
        pattern: "lukaszszukalski.pl/seeyoulater*",
        zone: "lukaszszukalski.pl",
      }),
      triggers.fetch({
        pattern: "lukaszszukalski.pl/ofe*",
        zone: "lukaszszukalski.pl",
      }),
    ],
    observability: {
      enabled: true,
      redactQueryString: true,
      logs: {
        enabled: true,
        invocationLogs: true,
        headSamplingRate: 0.1,
      },
      traces: {
        enabled: true,
        headSamplingRate: 0.01,
      },
    },
  },
});
