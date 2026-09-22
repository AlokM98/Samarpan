import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const target = resolve(root, "public/animation");
const siteAssets = resolve(root, "public/assets");
await rm(target, { recursive: true, force: true });
await mkdir(resolve(target, "src"), { recursive: true });
await mkdir(siteAssets, { recursive: true });
await cp(resolve(root, "assets/header_logo.png"), resolve(siteAssets, "header_logo.png"));
await cp(resolve(root, "animation.html"), resolve(target, "index.html"));
await cp(resolve(root, "animation-style.css"), resolve(target, "animation-style.css"));
await cp(resolve(root, "animation-bridge.js"), resolve(target, "animation-bridge.js"));
await cp(resolve(root, "src"), resolve(target, "src"), { recursive: true });
await cp(resolve(root, "assets"), resolve(target, "assets"), { recursive: true });
