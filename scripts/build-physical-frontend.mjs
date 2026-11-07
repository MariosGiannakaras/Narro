import { spawnSync } from "node:child_process";
// Independent output prevents test instrumentation leaking into a subsequent normal package.
const result = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--outDir", "dist-physical"],
  { stdio: "inherit", env: { ...process.env, NARRO_PHYSICAL_FRONTEND: "1" }, windowsHide: true });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
