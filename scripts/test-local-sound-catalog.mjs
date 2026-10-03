import {
  DEFAULT_NOTIFICATION_SOUND,
  DEFAULT_SUCCESS_SOUND,
  DEFAULT_TASK_ALERT_SOUND,
  LOCAL_SOUND_OPTIONS,
  isLocalSoundId,
  playLocalSoundPreview,
  stopLocalSoundPreview,
} from "../src/localSoundCatalog.ts";

function invariant(condition, message) {
  if (!condition) throw new Error(`Local sound catalog contract failed: ${message}`);
}

class FakeAudioParam {
  values = [];

  setValueAtTime(value) {
    this.values.push(value);
  }

  linearRampToValueAtTime(value) {
    this.values.push(value);
  }

  exponentialRampToValueAtTime(value) {
    this.values.push(value);
  }
}

class FakeGainNode {
  gain = new FakeAudioParam();

  connect() {}
}

class FakeOscillatorNode {
  type = "sine";
  frequency = new FakeAudioParam();

  connect() {}
  start() {}
  stop() {}
}

class FakeAudioContext {
  static instances = [];

  currentTime = 0;
  destination = {};
  state = "running";
  closed = false;

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  async resume() {
    this.state = "running";
  }

  async close() {
    this.closed = true;
    this.state = "closed";
  }

  createGain() {
    return new FakeGainNode();
  }

  createOscillator() {
    return new FakeOscillatorNode();
  }
}

globalThis.window = { AudioContext: FakeAudioContext };

invariant(
  LOCAL_SOUND_OPTIONS.map((sound) => sound.label).join("|")
    === "Futuristic Ding|Melodic Bell|Quick Chime|Victory Bell",
  "evidence-backed local catalog labels changed unexpectedly",
);
for (const sound of LOCAL_SOUND_OPTIONS) {
  invariant(isLocalSoundId(sound.id), `catalog id ${sound.id} must validate`);
}
invariant(!isLocalSoundId("https://example.com/remote.wav"), "remote URL must never validate as a local sound id");
invariant(DEFAULT_TASK_ALERT_SOUND === "melodic-bell", "task-alert default must match evidenced selector state");
invariant(DEFAULT_NOTIFICATION_SOUND === "futuristic-ding", "notification default must match evidenced selector state");
invariant(DEFAULT_SUCCESS_SOUND === "victory-bell", "success default must match evidenced selector state");

await playLocalSoundPreview(DEFAULT_TASK_ALERT_SOUND, 70);
const first = FakeAudioContext.instances[0];
invariant(first && !first.closed, "first preview must open one local audio context");

await playLocalSoundPreview(DEFAULT_NOTIFICATION_SOUND, 65);
const second = FakeAudioContext.instances[1];
invariant(first.closed, "starting a second preview must close the previous preview context");
invariant(second && !second.closed, "second preview must remain active after replacing the first");

stopLocalSoundPreview();
invariant(second.closed, "explicit preview stop must close the active preview context");

console.log("Local sound catalog contracts: PASS");
