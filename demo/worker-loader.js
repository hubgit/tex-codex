import "../src/worker.ts";

self.postMessage({ type: "worker:ready" });
