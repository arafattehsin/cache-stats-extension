import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uiPath = path.join(root, "extensions", "cache-stats", "ui.html");
const html = fs.readFileSync(uiPath, "utf8");
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

if (scripts.length === 0) {
    throw new Error(`No inline scripts found in ${uiPath}`);
}

for (const [index, match] of scripts.entries()) {
    new vm.Script(match[1], { filename: `ui.html#script-${index + 1}` });
}

console.log(`Checked ${scripts.length} inline script block(s).`);
