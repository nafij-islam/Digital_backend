import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/utils/slugify.js";
import { ApiResponse } from "../src/utils/apiResponse.js";
import { ApiError } from "../src/utils/apiError.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../src/validators/product.validator.js";

describe("Utility Tests", () => {
  test("slugify should generate clean URL-safe slugs", () => {
    assert.equal(slugify("Canva Pro Subscription!"), "canva-pro-subscription");
    assert.equal(slugify("ChatGPT Plus (GPT-4o & o1)"), "chatgpt-plus-gpt-4o-o1");
    assert.equal(slugify("Special  -- Spaces & * Symbols"), "special-spaces-symbols");
  });

  test("ApiResponse should construct correct response payload", () => {
    const resObj = new ApiResponse(200, "Success test", { id: 123 });
    assert.equal(resObj.success, true);
    assert.equal(resObj.statusCode, 200);
    assert.equal(resObj.message, "Success test");
    assert.deepEqual(resObj.data, { id: 123 });
  });

  test("ApiError should format error properties correctly", () => {
    const err = ApiError.notFound("Item not found");
    assert.equal(err.success, false);
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, "Item not found");
    assert.deepEqual(err.errors, []);
  });
});

describe("Validator Tests", () => {
  test("createProductSchema validates valid input with coercion", () => {
    const validData = {
      name: "YouTube Premium",
      price: "150",
      originalPrice: "300",
      description: "Full ad-free experience",
      imageUrl: "https://example.com/yt.png",
      isActive: "true",
    };

    const parsed = createProductSchema.parse(validData);
    assert.equal(parsed.name, "YouTube Premium");
    assert.equal(parsed.price, 150);
    assert.equal(parsed.originalPrice, 300);
    assert.equal(parsed.isActive, true);
  });

  test("createProductSchema rejects invalid price", () => {
    const invalidData = {
      name: "Test Product",
      price: -50,
      description: "A description here",
      imageUrl: "https://example.com/test.png",
    };

    assert.throws(() => {
      createProductSchema.parse(invalidData);
    });
  });

  test("productQuerySchema handles default pagination and sort", () => {
    const query = {};
    const parsed = productQuerySchema.parse(query);
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 20);
    assert.equal(parsed.sort, "newest");
  });
});
