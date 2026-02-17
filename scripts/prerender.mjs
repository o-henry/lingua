import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distDir = path.resolve("dist");
const templatePath = path.join(distDir, "index.html");
const serverEntryCandidates = [
  path.join(distDir, "server", "entry-server.js"),
  path.join(distDir, "server", "entry-server.mjs"),
];

const routes = [
  "/",
  "/setup",
  "/home",
  "/library",
  "/memories",
  "/resources",
  "/srs",
  "/settings",
  "/settings/memo",
];

const template = await fs.readFile(templatePath, "utf8");
const rootPattern = /<div id="root"><\/div>/;

if (!rootPattern.test(template)) {
  throw new Error("Could not find root container in dist/index.html");
}

let serverEntryPath = null;
for (const candidate of serverEntryCandidates) {
  try {
    await fs.access(candidate);
    serverEntryPath = candidate;
    break;
  } catch {
    // Continue until we find a valid bundle path.
  }
}

if (!serverEntryPath) {
  throw new Error("SSR bundle not found. Run the SSR build step before prerendering.");
}

const { render } = await import(pathToFileURL(serverEntryPath).href);

if (typeof render !== "function") {
  throw new Error("SSR entry is missing an exported render(url) function.");
}

for (const route of routes) {
  const appHtml = render(route);
  const html = template.replace(rootPattern, () => `<div id="root">${appHtml}</div>`);
  const outputPath = route === "/" ? templatePath : path.join(distDir, route.slice(1), "index.html");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
}
