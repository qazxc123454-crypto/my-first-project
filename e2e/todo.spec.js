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
