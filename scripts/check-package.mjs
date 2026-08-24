import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
    JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const packageJson = readJson("package.json");
const plugin = readJson("plugin.json");
const directManifest = readJson("copilot-extension.json");
const packagedManifest = readJson(
    path.join("extensions", "cache-stats", "copilot-extension.json"),
);
const packagedPackage = readJson(
    path.join("extensions", "cache-stats", "package.json"),
);

assert.equal(packageJson.name, "cache-stats");
assert.equal(plugin.name, packageJson.name);
assert.equal(plugin.version, packageJson.version);
assert.equal(plugin.license, packageJson.license);
assert.equal(plugin.logo, "assets/preview.png");
assert.equal(plugin.extensions, "extensions");
assert.ok(plugin.keywords.includes("canvas"));

for (const manifest of [directManifest, packagedManifest]) {
    assert.equal(manifest.name, packageJson.name);
    assert.equal(manifest.version, Number(packageJson.version.split(".")[0]));
}

assert.equal(packagedPackage.version, packageJson.version);
assert.equal(
    packagedPackage.dependencies["@github/copilot-sdk"],
    packageJson.dependencies["@github/copilot-sdk"],
);

const requiredFiles = [
    "assets/preview.png",
    "extension.mjs",
    "extensions/cache-stats/extension.mjs",
    "extensions/cache-stats/ui.html",
];
for (const relativePath of requiredFiles) {
    const filePath = path.join(root, relativePath);
    assert.ok(fs.statSync(filePath).isFile(), `${relativePath} must be a file`);
}

const pngSignature = fs
    .readFileSync(path.join(root, plugin.logo))
    .subarray(0, 8);
assert.deepEqual(
    [...pngSignature],
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
);

console.log("Package metadata and marketplace structure are consistent.");
