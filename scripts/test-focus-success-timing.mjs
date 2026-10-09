import fs from "node:fs";
import { focusReactionVariant } from "../src/focusReactionVariant.ts";
import assert from "node:assert/strict";
import { successTimingCopy } from "../src/focusSuccessTiming.ts";

assert.equal(successTimingCopy(8 * 60 * 60 + 45 * 60, "0"), "525 minutes early");
assert.equal(successTimingCopy(600, "0"), "10 minutes early");
assert.equal(successTimingCopy(600, "540"), "1 minute early");
assert.equal(successTimingCopy(600, "601"), "Less than a minute late");
assert.equal(successTimingCopy(600, "660"), "1 minute late");
assert.equal(successTimingCopy(600, "600"), "Right on time");
assert.equal(successTimingCopy(600, "599"), "Less than a minute early");
assert.equal(successTimingCopy(600, "630"), "Less than a minute late");
assert.equal(successTimingCopy(600, "999999999999999999"), "16666666666666657 minutes late");
assert.equal(successTimingCopy(null, "300"), null, "unknown EST suppresses projection");
assert.equal(successTimingCopy(300, null), null, "unknown Taken suppresses projection");
assert.equal(successTimingCopy(300, "Infinity"), null);
assert.equal(successTimingCopy(300, "-1"), null);
assert.equal(successTimingCopy(300, "1.5"), null);
assert.equal(successTimingCopy(300, " 50"), null);
assert.equal(successTimingCopy(300, "00"), null);
assert.equal(successTimingCopy(-1, "0"), null);
assert.equal(successTimingCopy(Number.MAX_SAFE_INTEGER + 1, "0"), null);
const reactionChoices = new Set(Array.from({ length: 128 }, (_, index) => focusReactionVariant(`task-${index}`)));
assert.deepEqual([...reactionChoices].sort(), ["confetti", "ribbon", "spark"], "varied completed tasks receive all three local reactions");
assert.equal(focusReactionVariant("same-task-id"), focusReactionVariant("same-task-id"), "reaction is stable for a persisted task identity");

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const source = read("src/FocusCompletionSuccess.tsx");
const actions = read("src/FocusLiveActions.tsx");
const reaction = read("src/FocusCelebrationReaction.tsx");
const css = read("src/focusCompletionSuccess.css");
assert.ok(source.includes("state.funGifEnabled === true"), "reaction must not render when Fun GIF is off or unknown");
assert.ok(actions.includes("funGifEnabled: celebration?.funGif === true"), "successful completion must consume the authoritative persisted preference");
assert.ok(source.includes("<FocusCelebrationReaction taskId={state.completedTaskId} />"), "reaction must use completed task identity");
assert.ok(reaction.includes('data-focus-success-reaction="true"'), "reaction DOM contract is missing");
assert.ok(css.includes("@media (prefers-reduced-motion:reduce)"), "reduced-motion behavior must remain effective");
assert.ok(css.includes("focus-reaction-spark") && css.includes("animation:"), "reaction requires finite local animation");
assert.ok(!reaction.includes("http://") && !reaction.includes("https://"), "reaction presentation must not request remote content");
const panel = read("src/FocusPanel.tsx");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
assert.ok(panel.includes('data-focus-success-inline-card="true"')
  && panel.includes('{completionSuccessContent}'),
  "B63 success must render as the active card while preserving the Focus queue");
assert.ok(coordinator.includes('completionSuccessContent={inlineSuccess && completionSuccess ? (')
  && coordinator.includes('completionSuccess && !inlineSuccess ? ('),
  "B63 Panel success is inline; Floating success keeps the established overlay");
assert.ok(source.includes('role={inline ? "region" : "dialog"}')
  && source.includes('aria-modal={inline ? undefined : "true"}'),
  "inline success must not falsely advertise a modal dialog");
assert.ok(css.includes('.focus-completion-success[data-focus-success-placement="inline"]')
  && css.includes('position: static;'),
  "inline success may not obscure the Focus header or remaining queue");
assert.ok(panel.includes('inert={Boolean(completionSuccessContent)}'),
  "the visible queue must not accept a second task mutation during success");
const successFixture = read("src/focusPanelVisualFixture.tsx");
const successCapture = read("scripts/capture-focus-panel-fixtures.ps1");
const successValidator = read("scripts/validate-focus-visual-state-captures.mjs");
assert.ok(successFixture.includes('"success"')
  && successFixture.includes("<FocusCompletionSuccess inline")
  && successFixture.includes('completionSuccessContent={scenario === "success"'),
  "B63 rendered fixture must mount the real committed success inline");
assert.ok(successCapture.includes('Name = "success"; Suffix = "-success"; Query = "&scenario=success"')
  && successValidator.includes('readCapture(theme, "success")')
  && successValidator.includes('data-focus-success-inline-card="true"'),
  "B63 screenshot must be captured and validated in light and dark themes");
console.log("Focus success timing and local Fun GIF reaction contracts: PASS");
