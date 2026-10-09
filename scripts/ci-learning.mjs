#!/usr/bin/env node
// Read-only CI discovery plus bounded, idempotent issue triage. Never modifies app/CI verdicts.
import { createHash } from "node:crypto";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function signalFromLog(log) {
  const lines = log.split(/\r?\n/).map(s => s.replace(/\x1b\[[0-9;]*m/g, "")
    .replace(/^\d{4}-\d\d-\d\dT\S+Z\s*/, "").trim());
  // Prefer the failing test over downstream artifact-upload and generic exit errors.
  for (const line of lines) {
    const test = /^test\s+([\w:.-]+)\s+\.\.\.\s+FAILED\b/.exec(line);
    if (test) return { kind: "rust-test", value: test[1] };
  }
  for (const line of lines) {
    const rust = /\berror\[E(\d{4})\]:/.exec(line);
    if (rust) return { kind: "rust-compiler", value: "E" + rust[1] };
    const ts = /\berror TS(\d{4,6}):/.exec(line);
    if (ts) return { kind: "typescript", value: "TS" + ts[1] };
  }
  for (const line of lines) {
    const os = /\bError:\s*(EPERM|EACCES|ENOENT|ENOSPC|ETIMEDOUT|ECONNRESET|EADDRINUSE)\b/i.exec(line);
    if (os) return { kind: "os-error", value: os[1].toUpperCase() };
  }
  return null; // Generic exit code alone is not a reliable match.
}

export function makeFingerprint(job, step, signal) {
  if (!signal || !job || !step) return null;
  return createHash("sha256").update(["windows-ci", job, step, signal.kind, signal.value]
    .join("|")).digest("hex").slice(0, 24);
}

export function repeatGroups(items) {
  const groups = new Map();
  for (const item of items) {
    if (!item.fingerprint) continue;
    const group = groups.get(item.fingerprint) || { ...item, occurrences: new Map() };
    const prior = group.occurrences.get(item.runId);
    if (!prior || prior.attempt > item.attempt) group.occurrences.set(item.runId, item);
    groups.set(item.fingerprint, group);
  }
  return [...groups.values()].filter(g => g.occurrences.size >= 2)
    .sort((a, b) => b.occurrences.size - a.occurrences.size);
}

function client(token, repo) {
  const base = "https://api.github.com/repos/" + repo;
  const headers = { "Accept": "application/vnd.github+json", "Content-Type": "application/json", "Authorization": "Bearer " + token,
    "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "narro-ci-learning" };
  return {
    async json(path, init = {}) {
      const result = await fetch(base + path, { ...init, headers, redirect: "manual" });
      if (!result.ok) throw new Error("GitHub HTTP " + result.status + " for " + path);
      return result.json();
    },
    async logs(jobId) {
      const response = await fetch(base + "/actions/jobs/" + jobId + "/logs",
        { headers, redirect: "manual" });
      if (![200, 302].includes(response.status)) throw new Error("Log HTTP " + response.status);
      const location = response.headers.get("location");
      if (response.status === 302 && (!location || !location.startsWith("https://")))
        throw new Error("Unsafe log redirect");
      // Never send GITHUB_TOKEN to the external temporary blob endpoint.
      const raw = response.status === 302 ? await fetch(location) : response;
      if (!raw.ok || !raw.body) throw new Error("Log content unavailable");
      const reader = raw.body.getReader();
      const bytes = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > 6000000) { await reader.cancel(); throw new Error("Log size cap"); }
        bytes.push(value);
      }
      const buffer = new Uint8Array(total);
      let pos = 0;
      for (const part of bytes) { buffer.set(part, pos); pos += part.length; }
      return new TextDecoder().decode(buffer);
    }
  };
}

async function scan(api) {
  const cutoff = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const query = new URLSearchParams({ status: "completed", created: ">=" + cutoff, per_page: "100" });
  const page = await api.json("/actions/workflows/ci.yml/runs?" + query);
  const recent = page.workflow_runs || [];
  const failed = recent.filter(r => ["failure", "timed_out"].includes(r.conclusion) || r.run_attempt > 1);
  let truncated = page.total_count > recent.length || failed.length > 45, unknown = 0, logs = 0;
  const observations = [];
  for (const run of failed.slice(0, 45)) {
    if (run.run_attempt > 3) truncated = true;
    for (let attempt = 1; attempt <= Math.min(run.run_attempt || 1, 3); attempt++) {
      let jobs;
      try {
        jobs = (await api.json("/actions/runs/" + run.id +
          "/attempts/" + attempt + "/jobs?per_page=100")).jobs || [];
      } catch (error) { unknown++; console.warn("Run " + run.id + ": " + error.message); continue; }
      if (jobs.length === 100) truncated = true;
      for (const job of jobs.filter(j => j.conclusion === "failure")) {
        const step = (job.steps || []).find(s => s.conclusion === "failure");
        if (!step || logs >= 50) { unknown++; truncated ||= logs >= 50; continue; }
        try {
          const log = await api.logs(job.id);
          logs++;
          const signal = signalFromLog(log), fingerprint = makeFingerprint(job.name, step.name, signal);
          if (!fingerprint) { unknown++; continue; }
          observations.push({ fingerprint, signal, job: job.name, step: step.name,
            runId: run.id, attempt, url: run.html_url });
        } catch (error) { unknown++; console.warn("Job " + job.id + ": " + error.message); }
      }
    }
  }
  return { groups: repeatGroups(observations), runs: recent.length, logs, unknown, truncated };
}

async function issues(api, groups) {
  const existing = [];
  let complete = false;
  for (let page = 1; page <= 5; page++) {
    const records = await api.json("/issues?state=all&per_page=100&page=" + page);
    existing.push(...records.filter(r => !r.pull_request));
    if (records.length < 100) { complete = true; break; }
  }
  if (!complete) throw new Error("Too many issues for safe deduplication; no writes made");
  let created = 0;
  for (const group of groups) {
    const marker = "<!-- narro-ci-learning:" + group.fingerprint + " -->";
    if (existing.some(i => (i.body || "").includes(marker))) continue;
    if (created >= 5) break;
    const runs = [...group.occurrences.values()].sort((a, b) => b.runId - a.runId);
    const evidence = runs.slice(0, 12).map(r =>
      "- [Run " + r.runId + ", attempt " + r.attempt + "](" + r.url + ")").join("\n");
    const body = [marker,
      "Automatically detected **recurring CI failure candidate**, not a confirmed common root cause.",
      "",
      "Windows CI primary failed job: " + group.job,
      "Primary failed step: " + group.step,
      "Diagnostic category: " + group.signal.kind + " / " + group.signal.value,
      "Independent run IDs: " + group.occurrences.size,
      "", evidence, "",
      "**Human/agent triage required:** compare exact logs and attempts; distinguish application, test/harness, infrastructure and cancellation; identify the causal boundary and why checks missed it; add the smallest regression/preflight guard; record immutable work-log evidence; strengthen the matching NER register row only for a reusable lesson.",
      "A successful rerun is not root-cause proof. This issue does not change PR, CI, physical or parity acceptance."
    ].join("\n");
    const result = await api.json("/issues", { method: "POST",
      body: JSON.stringify({ title: ("CI recurrence candidate: " + group.step +
        " / " + group.signal.kind + " " + group.signal.value).slice(0, 180), body }) });
    console.log("Created issue #" + result.number + " for " + group.fingerprint);
    created++;
  }
  return created;
}

async function main() {
  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo))
    throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY required");
  const api = client(token, repo), result = await scan(api);
  const summary = "CI recurrence scan (14-day window): " + result.runs +
    " completed runs, " + result.logs + " failed job logs, " +
    result.groups.length + " candidate families, " + result.unknown +
    " unclassified; coverage limited=" + result.truncated +
    "\nThese are matching signals, not confirmed causes or flaky verdicts.\n" +
    result.groups.map(g => "- " + g.fingerprint + ": " + g.occurrences.size +
      " distinct runs; " + g.job + " / " + g.step + " / " + g.signal.kind +
      " " + g.signal.value).join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "## Narro CI learning\n\n" + summary + "\n");
  if (process.env.CI_LEARNING_DRY_RUN === "1") return;
  console.log("New triage issues: " + await issues(api, result.groups));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(e => { console.error(e.message); process.exitCode = 1; });
