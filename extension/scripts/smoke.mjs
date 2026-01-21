import fs from "fs";

const required = [
  "src/content/injector.ts",
  "src/background/service_worker.ts",
  "src/core/policy/policy_scan.ts",
  "manifest.json",
  "vite.config.ts"
];

let ok = true;

for (const f of required) {
  const p = new URL(`../${f}`, import.meta.url);
  if (!fs.existsSync(p)) {
    console.error("❌ missing:", f);
    ok = false;
  } else {
    console.log("✅", f);
  }
}

if (!ok) process.exit(1);
console.log("\n✅ SMOKE OK");
