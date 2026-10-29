const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  getAssetVersion,
  syncAssetVersions,
} = require("../scripts/sync-asset-versions.js");

const ASSETS = ["styles.css", "todo-utils.js", "script.js"];
const HTML = `<link rel="stylesheet" href="styles.css?v=old">
<script src="todo-utils.js?v=old"></script>
<script src="script.js?v=old"></script>
`;

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "todo-asset-versions-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const asset of ASSETS) fs.writeFileSync(path.join(root, asset), asset);
  fs.writeFileSync(path.join(root, "index.html"), HTML);
  return root;
}

test("版本固定為 12 位十六進位，任一資源內容改變都會更新版本", (t) => {
  const root = fixture(t);
  const original = getAssetVersion(root);
  assert.match(original, /^[a-f0-9]{12}$/);
  assert.equal(getAssetVersion(root), original);
  for (const asset of ASSETS) {
    fs.appendFileSync(path.join(root, asset), "changed");
    assert.notEqual(getAssetVersion(root), original);
    fs.writeFileSync(path.join(root, asset), asset);
  }
});

test("更新三個相同版本並保留其他 HTML，重複同步結果不變", (t) => {
  const root = fixture(t);
  const { version } = syncAssetVersions(root);
  const updated = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.equal(updated, HTML.replaceAll("v=old", `v=${version}`));
  assert.equal(syncAssetVersions(root).changed, false);
  assert.equal(fs.readFileSync(path.join(root, "index.html"), "utf8"), updated);
});

test("檢查模式成功時不修改 HTML 或三個資源", (t) => {
  const root = fixture(t);
  syncAssetVersions(root);
  const names = ["index.html", ...ASSETS];
  const before = names.map((name) => fs.readFileSync(path.join(root, name)));
  assert.equal(syncAssetVersions(root, { check: true }).changed, false);
  names.forEach((name, i) => {
    assert.deepEqual(fs.readFileSync(path.join(root, name)), before[i]);
  });
});

test("錯誤版本檢查失敗且不修正檔案，CLI 回傳非零結束碼", (t) => {
  const root = fixture(t);
  const scripts = path.join(root, "scripts");
  fs.mkdirSync(scripts);
  const cli = path.join(scripts, "sync-asset-versions.js");
  fs.copyFileSync(
    path.join(__dirname, "../scripts/sync-asset-versions.js"),
    cli,
  );
  assert.throws(() => syncAssetVersions(root, { check: true }), /do not match/);
  const result = spawnSync(process.execPath, [cli, "--check"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /do not match/);
  assert.equal(fs.readFileSync(path.join(root, "index.html"), "utf8"), HTML);
});

test("同步後資源變更，或三個版本不一致，檢查必須失敗", (t) => {
  const root = fixture(t);
  syncAssetVersions(root);
  const htmlPath = path.join(root, "index.html");
  const synced = fs.readFileSync(htmlPath, "utf8");
  fs.appendFileSync(path.join(root, "styles.css"), "changed");
  assert.throws(() => syncAssetVersions(root, { check: true }), /do not match/);
  fs.writeFileSync(path.join(root, "styles.css"), "styles.css");
  fs.writeFileSync(htmlPath, synced.replace(/v=[a-f0-9]{12}/, "v=wrong"));
  assert.throws(() => syncAssetVersions(root, { check: true }), /do not match/);
});

test("遺漏或重複資源引用時停止，不寫入 HTML", (t) => {
  const root = fixture(t);
  const htmlPath = path.join(root, "index.html");
  for (const html of [
    HTML.replace(/<link[^>]*>\n/, ""),
    HTML + '<script src="script.js"></script>',
  ]) {
    fs.writeFileSync(htmlPath, html);
    assert.throws(() => syncAssetVersions(root), /exactly one reference/);
    assert.equal(fs.readFileSync(htmlPath, "utf8"), html);
  }
});
