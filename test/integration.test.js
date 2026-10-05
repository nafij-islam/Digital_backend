import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

let server;
let baseUrl;

describe("Express Route Integration Tests", () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test("GET / should return 200 and API index welcome", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.statusCode, 200);
    assert.ok(body.data.service);
  });

  test("GET /api/health should return status ok", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, "ok");
  });

  test("GET /non-existent-route should return standardized 404 JSON", async () => {
    const res = await fetch(`${baseUrl}/api/invalid-endpoint-test`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.statusCode, 404);
    assert.ok(body.message.includes("does not exist"));
  });

  test("POST /api/admin/products with invalid data returns 400 validation error", async () => {
    const res = await fetch(`${baseUrl}/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // missing required fields: name, description, price, imageUrl
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.statusCode, 400);
    assert.ok(Array.isArray(body.errors));
    assert.ok(body.errors.length > 0);
  });
});
