import assert from "node:assert/strict";
import { test } from "node:test";
import { deletedPosts } from "../scripts/telegram/sync.mjs";

// Article ids 100..149 in the store; the channel read saw posts 5..160.
const articles = Array.from({ length: 50 }, (_, index) => 100 + index);
const channel = (...gone) => new Set(Array.from({ length: 156 }, (_, index) => 5 + index).filter((id) => !gone.includes(id)));

test("removes the articles of posts deleted from the channel", () => {
  assert.deepEqual(deletedPosts(articles, channel(120, 149)), { remove: [120, 149], held: 0 });
  assert.deepEqual(deletedPosts(articles, channel()), { remove: [], held: 0 });
});

test("removes nothing when the read stopped before the oldest article", () => {
  const partial = new Set([...channel(120)].filter((id) => id >= 110));
  assert.deepEqual(deletedPosts(articles, partial), { remove: [], held: 0 });
});

test("holds back a removal of many articles at once unless forced", () => {
  const gone = articles.slice(0, 11);
  assert.deepEqual(deletedPosts(articles, channel(...gone)), { remove: [], held: 11 });
  assert.deepEqual(deletedPosts(articles, channel(...gone), { force: true }), { remove: gone, held: 0 });
});
