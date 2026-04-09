#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { readJson } from "../papers/lib/io.mjs";

function parseArgs(argv) {
  const args = {
    manifest: "data/models/current/run.manifest.json",
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--manifest" && argv[i + 1]) args.manifest = argv[++i];
    else if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log("Usage: node scripts/model/evaluate-framework.mjs [--manifest <file>]");
    return;
  }

  const manifestPath = path.resolve(process.cwd(), args.manifest);
  const manifest = await readJson(manifestPath);
  const output = {
    runId: manifest.runId,
    frameworkVersion: manifest.frameworkVersion,
    qualityGate: manifest.qualityGate,
  };
  console.log(JSON.stringify(output, null, 2));
  if (!manifest?.qualityGate?.passed) process.exit(2);
}

main().catch((error) => {
  console.error(`[model:eval] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
