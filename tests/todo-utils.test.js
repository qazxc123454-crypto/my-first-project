const test = require("node:test");
const assert = require("node:assert/strict");
const { countUnfinishedTodos } = require("../todo-utils.js");

test("空清單的未完成任務數量為 0", function () {
  assert.equal(countUnfinishedTodos([]), 0);
});

test("全部未完成時，回傳所有任務數量", function () {
  const todos = [
    { id: "1", text: "買牛奶", done: false },
    { id: "2", text: "讀書", done: false },
    { id: "3", text: "散步", done: false },
  ];

  assert.equal(countUnfinishedTodos(todos), 3);
});

test("部分完成時，只計算未完成任務", function () {
  const todos = [
    { id: "1", text: "買牛奶", done: false },
    { id: "2", text: "讀書", done: true },
    { id: "3", text: "散步", done: false },
  ];

  assert.equal(countUnfinishedTodos(todos), 2);
});

test("全部完成時，未完成任務數量為 0", function () {
  const todos = [
    { id: "1", text: "買牛奶", done: true },
    { id: "2", text: "讀書", done: true },
    { id: "3", text: "散步", done: true },
  ];

  assert.equal(countUnfinishedTodos(todos), 0);
});
