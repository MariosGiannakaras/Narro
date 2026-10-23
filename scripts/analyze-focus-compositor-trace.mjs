#!/usr/bin/env node
/**
 * Offline A02 compositor timing correlation. Never reads UI text, DB or pixels.
 *
 * Usage: node scripts/analyze-focus-compositor-trace.mjs trace.jsonl frames.json [output.json]
 * QPC is a per-machine Windows monotonic clock: it correlates samples from
 * processes without assuming matching process start times.
 * The screenshot was sampled between captureQpcBefore/After. Neither this
 * bracket nor UpdateLayeredWindow proves the DWM scanout instant.
 */
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function correlateFocusTrace(records, frameInput) {
  const frames = Array.isArray(frameInput) ? frameInput : frameInput?.frames;
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new Error("No screen-sampled frame records.");
  }
  const events = records.filter((r) => Number.isFinite(r.qpcTicks) && Number.isFinite(r.qpcFrequency))
    .sort((a, b) => a.qpcTicks - b.qpcTicks);
  if (events.length === 0) throw new Error("Native QPC events missing; cannot correlate.");
  const hz = events[0].qpcFrequency;
  if (hz <= 0 || !events.every((r) => r.qpcFrequency === hz)) {
    throw new Error("Trace contains inconsistent native QPC frequencies.");
  }
  const samples = frames.map((frame) => {
    const before = Number(frame.captureQpcBefore);
    const after = Number(frame.captureQpcAfter);
    const frequency = Number(frame.captureQpcFrequency);
    if (!Number.isFinite(before) || !Number.isFinite(after) || after < before || frequency !== hz) {
      throw new Error("Screen sample QPC bracket missing, reversed, or from a different timebase.");
    }
    const midpoint = (before + after) / 2;
    const prior = [...events].reverse().find((e) => e.qpcTicks <= before) ?? null;
    const following = events.find((e) => e.qpcTicks >= after) ?? null;
    const within = events.filter((e) => e.qpcTicks >= before && e.qpcTicks <= after);
    const nearest = events.reduce((best, e) =>
      best === null || Math.abs(e.qpcTicks - midpoint) < Math.abs(best.qpcTicks - midpoint)
        ? e : best, null);
    const phase = (e) => e && ({
      stage: e.stage,
      rasterToken: e.rasterToken,
      qpcTicks: e.qpcTicks,
      relativeToScreenMs: Math.round((e.qpcTicks - midpoint) * 1000 / hz * 1000) / 1000,
      step: e.details?.data?.step ?? null,
      easedProgress: e.details?.data?.easedProgress ?? null,
    });
    return {
      frameIndex: frame.index,
      fileName: frame.fileName,
      captureQpcBefore: before,
      captureQpcAfter: after,
      bracketMs: (after - before) * 1000 / hz,
      native: frame.native ?? null,
      prior: phase(prior),
      duringCapture: within.map(phase),
      following: phase(following),
      nearest: phase(nearest),
      claim: "native-call-phase-near-screen-sample; DWM-scanout-unconfirmed",
    };
  });
  return {
    schemaVersion: 1,
    qpcFrequency: hz,
    frames: samples,
    totalTraceEvents: events.length,
    outsideTraceBracket: samples.filter((x) => x.prior === null || x.following === null).length,
    interpretation: "QPC brackets bound screen CopyFromScreen. Native call completion does not confirm DWM scanout or WebView2 paint.",
  };
}

function runCli() {
  const [, , tracePath, framesPath, resultPath] = process.argv;
  if (!tracePath || !framesPath) {
    throw new Error("Usage: node scripts/analyze-focus-compositor-trace.mjs trace.jsonl frames.json [output.json]");
  }
  const lines = fs.readFileSync(tracePath, "utf8").split(/\r?\n/).filter(Boolean);
  const records = lines.map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new Error("Malformed trace JSONL line " + (index + 1) + ": " + String(error)); }
  });
  const results = correlateFocusTrace(records, JSON.parse(fs.readFileSync(framesPath, "utf8")));
  const encoded = JSON.stringify(results, null, 2) + "\n";
  if (resultPath) fs.writeFileSync(resultPath, encoded);
  else process.stdout.write(encoded);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { runCli(); }
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
