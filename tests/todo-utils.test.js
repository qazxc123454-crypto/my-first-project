const test = require("node:test");
const assert = require("node:assert/strict");
const { countUnfinishedTodos, filterTodos } = require("../todo-utils.js");

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

test("搜尋任務名稱中的部分文字", function () {
  const todos = [
    { id: "1", text: "買牛奶", done: false },
    { id: "2", text: "讀書", done: false },
  ];

  assert.deepEqual(filterTodos(todos, "牛"), [todos[0]]);
  assert.deepEqual(filterTodos(todos, "1"), []);
});

test("英文搜尋不區分任務與關鍵字的大小寫", function () {
  const todos = [
    { id: "1", text: "Read BOOK", done: false },
    { id: "2", text: "Buy milk", done: true },
  ];

  assert.deepEqual(filterTodos(todos, "bOoK"), [todos[0]]);
  assert.deepEqual(filterTodos(todos, "MILK"), [todos[1]]);
});

test("搜尋忽略關鍵字前後空白", function () {
  const todos = [{ id: "1", text: "買牛奶", done: false }];

  assert.deepEqual(filterTodos(todos, " \t牛奶\n "), todos);
});

test("空字串或只有空白時回傳全部任務", function () {
  const todos = [
    { id: "1", text: "買牛奶", done: false },
    { id: "2", text: "讀書", done: true },
  ];

  assert.deepEqual(filterTodos(todos, ""), todos);
  assert.deepEqual(filterTodos(todos, " \t\n "), todos);
});

test("搜尋同時包含已完成與未完成任務", function () {
  const todos = [
    { id: "1", text: "閱讀小說", done: true },
    { id: "2", text: "閱讀報紙", done: false },
    { id: "3", text: "散步", done: false },
  ];

  assert.deepEqual(filterTodos(todos, "閱讀"), [todos[0], todos[1]]);
});

test("沒有符合結果時回傳空陣列", function () {
  const todos = [{ id: "1", text: "買牛奶", done: false }];

  assert.deepEqual(filterTodos(todos, "跑步"), []);
  assert.deepEqual(filterTodos([], "牛奶"), []);
});

test("搜尋結果維持原本任務順序", function () {
  const todos = [
    { id: "3", text: "閱讀 Z", done: false },
    { id: "1", text: "散步", done: false },
    { id: "2", text: "閱讀 A", done: true },
  ];

  assert.deepEqual(filterTodos(todos, "閱讀"), [todos[0], todos[2]]);
});

test("搜尋不修改原始陣列或任務物件", function () {
  const original = [
    { id: "1", text: "Read BOOK", done: false },
    { id: "2", text: "買牛奶", done: true },
  ];
  const todos = Object.freeze(
    original.map(function (todo) {
      return Object.freeze({ ...todo });
    }),
  );

  assert.deepEqual(filterTodos(todos, "book"), [original[0]]);
  assert.deepEqual(filterTodos(todos, ""), original);
  assert.deepEqual(filterTodos(todos, "沒有符合"), []);
  assert.deepEqual(todos, original);
});
