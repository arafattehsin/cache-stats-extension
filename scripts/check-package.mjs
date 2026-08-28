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
    path.join(
        "com.github.copilot",
        "extensions",
        "cache-stats",
        "copilot-extension.json",
    ),
);
const packagedPackage = readJson(
    path.join("com.github.copilot", "extensions", "cache-stats", "package.json"),
);

const agentPluginSchema =
    "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const agentPluginFields = new Set([
    "$schema",
    "name",
    "version",
    "description",
    "author",
    "homepage",
    "repository",
    "license",
    "keywords",
    "extensions",
]);

assert.equal(packageJson.name, "cache-stats");
assert.equal(plugin.$schema, agentPluginSchema);
assert.equal(plugin.name, packageJson.name);
assert.equal(plugin.version, packageJson.version);
assert.equal(plugin.license, packageJson.license);
assert.ok(plugin.keywords.includes("canvas"));
assert.deepEqual(
    Object.keys(plugin).filter((field) => !agentPluginFields.has(field)),
    [],
);
assert.deepEqual(plugin.extensions, {
    "com.github.copilot": {
        logo: "assets/preview.png",
    },
});

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
    "com.github.copilot/extensions/cache-stats/extension.mjs",
    "com.github.copilot/extensions/cache-stats/ui.html",
];
for (const relativePath of requiredFiles) {
    const filePath = path.join(root, relativePath);
    assert.ok(fs.statSync(filePath).isFile(), `${relativePath} must be a file`);
}

const pngSignature = fs
    .readFileSync(
        path.join(root, plugin.extensions["com.github.copilot"].logo),
    )
    .subarray(0, 8);
assert.deepEqual(
    [...pngSignature],
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
);

console.log("Agent Plugin metadata and Copilot extension structure are consistent.");
