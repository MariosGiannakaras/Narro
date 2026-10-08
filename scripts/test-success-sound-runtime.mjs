import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error(`Success sound contract failed: ${message}`);
}

const liveActions = fs.readFileSync("src/FocusLiveActions.tsx", "utf8");
const catalog = fs.readFileSync("src/localSoundCatalog.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const required of [
  "const celebration = preferences.snapshot?.celebration",
  "celebration.successSound ?? DEFAULT_SUCCESS_SOUND",
  "celebration.successSoundVolumePercent",
  "celebration?.successSoundEnabled",
  "playLocalSound(",
  "onCompletionSuccess?.({",
]) {
  invariant(liveActions.includes(required), `Focus completion path is missing ${required}`);
}

invariant(
  liveActions.indexOf("const completed = await completeTimerTask()")
    < liveActions.indexOf("const celebration = preferences.snapshot?.celebration"),
  "success sound must only run after authoritative completion commits",
);
invariant(
  liveActions.indexOf("const celebration = preferences.snapshot?.celebration")
    < liveActions.indexOf("if (showSuccessScreen)"),
  "sound toggle may play after committed completion independently of success-screen visuals",
);
invariant(
  catalog.includes('DEFAULT_SUCCESS_SOUND: LocalSoundId = "victory-bell"'),
  "success runtime must share the evidenced bundled default",
);
invariant(
  pkg.scripts["test:success-sound-runtime"] === "node scripts/test-success-sound-runtime.mjs",
  "success sound test registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:success-sound-runtime"),
  "frontend preflight must include success sound contracts",
);

console.log("Success sound runtime contracts: PASS");
