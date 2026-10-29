const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ASSETS = ["styles.css", "todo-utils.js", "script.js"];

function getAssetVersion(root) {
  const hash = createHash("sha256");
  for (const asset of ASSETS) {
    const content = fs.readFileSync(path.join(root, asset));
    // Include names and byte lengths so file boundaries are unambiguous.
    hash.update(`${asset}\0${content.length}\0`);
    hash.update(content);
  }
  return hash.digest("hex").slice(0, 12);
}

function updateReferences(html, version) {
  const counts = Object.fromEntries(ASSETS.map((asset) => [asset, 0]));
  const updated = html.replace(/<(link|script)\b[^>]*>/gi, (tag, tagName) =>
    tag.replace(
      /\b(href|src)\s*=\s*(["'])(.*?)\2/gi,
      (attribute, name, quote, url) => {
        if (
          (tagName.toLowerCase() === "link" && name.toLowerCase() !== "href") ||
          (tagName.toLowerCase() === "script" && name.toLowerCase() !== "src")
        ) {
          return attribute;
        }
        const [beforeFragment, ...fragment] = url.split("#");
        const [pathname, ...query] = beforeFragment.split("?");
        const asset = pathname.replace(/^\.\//, "");
        if (!ASSETS.includes(asset)) return attribute;
        counts[asset]++;
        const parameters = new URLSearchParams(query.join("?"));
        parameters.set("v", version);
        const suffix = fragment.length ? `#${fragment.join("#")}` : "";
        return attribute.replace(url, `${pathname}?${parameters}${suffix}`);
      },
    ),
  );
  for (const asset of ASSETS) {
    if (counts[asset] !== 1) {
      throw new Error(
        `Expected exactly one reference to ${asset}; found ${counts[asset]}`,
      );
    }
  }
  return updated;
}

function syncAssetVersions(root, { check = false } = {}) {
  const version = getAssetVersion(root);
  const htmlPath = path.join(root, "index.html");
  const original = fs.readFileSync(htmlPath, "utf8");
  const updated = updateReferences(original, version);
  const changed = original !== updated;
  if (check && changed) {
    throw new Error(
      `Asset versions do not match content (${version}). Run npm run sync.`,
    );
  }
  if (!check && changed) fs.writeFileSync(htmlPath, updated);
  return { version, changed };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
      throw new Error("Usage: node scripts/sync-asset-versions.js [--check]");
    }
    const result = syncAssetVersions(path.join(__dirname, ".."), {
      check: args[0] === "--check",
    });
    console.log(
      `Asset version ${result.version}: ${args[0] ? "check passed" : "synced"}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { getAssetVersion, syncAssetVersions };
