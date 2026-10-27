const { test, expect } = require("@playwright/test");

test("新增任務後重新整理，任務仍保留且不重複", async function ({ page }) {
  await page.goto("/");

  const items = page.locator("#todo-list > li");
  const taskText = page.locator("#todo-list .todo-text");
  const remainingCount = page.locator("#remaining-count");

  await expect(items).toHaveCount(0);
  await expect(remainingCount).toHaveText("剩餘 0 項未完成任務");

  await page.getByLabel("新增任務", { exact: true }).fill("E2E 測試任務");
  await page.getByRole("button", { name: "新增", exact: true }).click();

  await expect(items).toHaveCount(1);
  await expect(taskText).toHaveText(["E2E 測試任務"]);
  await expect(remainingCount).toHaveText("剩餘 1 項未完成任務");

  await page.reload();

  await expect(items).toHaveCount(1);
  await expect(taskText).toHaveText(["E2E 測試任務"]);
  await expect(remainingCount).toHaveText("剩餘 1 項未完成任務");
});

async function addTasks(page, taskNames) {
  for (const taskName of taskNames) {
    await page.getByLabel("新增任務", { exact: true }).fill(taskName);
    await page.getByRole("button", { name: "新增", exact: true }).click();
  }
}

test("搜尋即時篩選，清空恢復全部，無結果提示正確切換", async function ({
  page,
}) {
  await page.goto("/");
  const search = page.getByLabel("搜尋任務", { exact: true });
  const taskText = page.locator("#todo-list .todo-text");
  const noResults = page.getByRole("status");

  await expect(noResults).toBeHidden();
  await addTasks(page, ["買牛奶", "讀書", "買水果"]);

  await search.fill("買");
  await expect(taskText).toHaveText(["買牛奶", "買水果"]);
  await search.fill("  牛奶  ");
  await expect(taskText).toHaveText(["買牛奶"]);
  await search.fill("不存在的任務");
  await expect(taskText).toHaveCount(0);
  await expect(noResults).toHaveText("找不到符合的任務");
  await expect(noResults).toBeVisible();

  await search.fill("");
  await expect(taskText).toHaveText(["買牛奶", "讀書", "買水果"]);
  await expect(noResults).toBeHidden();
  await search.fill("   ");
  await expect(taskText).toHaveText(["買牛奶", "讀書", "買水果"]);
  await expect(noResults).toBeHidden();
});

test("英文搜尋不分大小寫且包含已完成任務，剩餘總數不受篩選影響", async function ({
  page,
}) {
  await page.goto("/");
  await addTasks(page, ["Read BOOK", "book report", "買牛奶"]);
  await page.locator("#todo-list > li").first().getByRole("checkbox").check();

  const remainingCount = page.locator("#remaining-count");
  const search = page.getByLabel("搜尋任務", { exact: true });
  const taskText = page.locator("#todo-list .todo-text");
  await expect(remainingCount).toHaveText("剩餘 2 項未完成任務");

  await search.fill("bOoK");
  await expect(taskText).toHaveText(["Read BOOK", "book report"]);
  await expect(
    page.locator("#todo-list > li").first().getByRole("checkbox"),
  ).toBeChecked();
  await search.fill("READ");
  await expect(taskText).toHaveText(["Read BOOK"]);
  await expect(remainingCount).toHaveText("剩餘 2 項未完成任務");
});

test("純搜尋及清空搜尋不改變 localStorage 原始內容", async function ({ page }) {
  await page.goto("/");
  // Set up data before the observation window; only search during observation.
  await addTasks(page, ["Read BOOK", "買牛奶"]);
  const readStorage = () =>
    page.evaluate(() => globalThis.localStorage.getItem("todo-list-v1"));
  const originalStorage = await readStorage();
  expect(originalStorage).not.toBeNull();

  const search = page.getByLabel("搜尋任務", { exact: true });
  const taskText = page.locator("#todo-list .todo-text");
  for (const [keyword, expectedTasks] of [
    ["book", ["Read BOOK"]],
    ["不存在", []],
    ["   ", ["Read BOOK", "買牛奶"]],
    ["", ["Read BOOK", "買牛奶"]],
  ]) {
    await search.fill(keyword);
    await expect(taskText).toHaveCount(expectedTasks.length);
    if (expectedTasks.length > 0) {
      await expect(taskText).toHaveText(expectedTasks);
    }
    expect(await readStorage()).toBe(originalStorage);
  }
});

test("搜尋中新增不符合任務仍保存，重新整理清空搜尋並保留全部任務", async function ({
  page,
}) {
  await page.goto("/");
  await addTasks(page, ["Read BOOK"]);
  const search = page.getByLabel("搜尋任務", { exact: true });
  const taskText = page.locator("#todo-list .todo-text");
  const remainingCount = page.locator("#remaining-count");

  await search.fill("book");
  await addTasks(page, ["買牛奶"]);
  await expect(taskText).toHaveText(["Read BOOK"]);
  await expect(remainingCount).toHaveText("剩餘 2 項未完成任務");
  await search.fill("");
  await expect(taskText).toHaveText(["Read BOOK", "買牛奶"]);

  await search.fill("book");
  await expect(taskText).toHaveText(["Read BOOK"]);
  await page.reload();
  await expect(search).toHaveValue("");
  await expect(taskText).toHaveText(["Read BOOK", "買牛奶"]);
  await expect(page.locator("#todo-list > li")).toHaveCount(2);
  await expect(remainingCount).toHaveText("剩餘 2 項未完成任務");
  await expect(page.getByRole("status")).toBeHidden();
});
