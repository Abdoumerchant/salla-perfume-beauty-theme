import test from "node:test";
import assert from "node:assert/strict";
import { handle, validate } from "./src/index.js";

const env = { ALLOWED_ORIGIN: "https://shop.example" };
const good = { age: 30, gender: "ذكر", weight: 80, height: 175, activity_level: "متوسط", goal: "إنقاص الوزن" };
const req = (body, origin = env.ALLOWED_ORIGIN) =>
  new Request("https://w.dev", { method: "POST", headers: { Origin: origin }, body: JSON.stringify(body) });
const plan = { user_summary: { bmr: 1749 } };
const client = (calls) => ({ beta: { messages: { create: async (p) => { calls.push(p); return { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(plan) }] }; } } } });

test("rejects bad origin and bad input without calling Claude", async () => {
  const calls = [];
  assert.equal((await handle(req(good, "https://evil.com"), env, client(calls))).status, 403);
  assert.equal((await handle(req({ ...good, age: 5 }), env, client(calls))).status, 400);
  assert.equal(calls.length, 0);
});

test("returns Claude JSON and sends user text as data, truncated", async () => {
  const calls = [];
  const r = await handle(req({ ...good, health_conditions: "x".repeat(500) }), env, client(calls));
  assert.deepEqual(await r.json(), plan);
  assert.equal(calls[0].output_config.format.type, "json_schema");
  assert.ok(calls[0].messages[0].content.length < 600);
});

test("validate fills defaults", () => assert.equal(validate(good).health_conditions, "لا يوجد"));
