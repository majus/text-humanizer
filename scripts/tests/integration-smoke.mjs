#!/usr/bin/env node
import assert from "node:assert/strict";
import path from "node:path";
import { fileExists, readJson } from "../papers/lib/io.mjs";

async function main() {
  const benchmarkManifestPath = path.resolve(process.cwd(), "data/papers/benchmark/current/run.manifest.json");
  const modelManifestPath = path.resolve(process.cwd(), "data/models/current/run.manifest.json");
  assert.equal(await fileExists(benchmarkManifestPath), true, "Missing benchmark current manifest.");
  assert.equal(await fileExists(modelManifestPath), true, "Missing model current manifest.");

  const benchmark = await readJson(benchmarkManifestPath);
  const model = await readJson(modelManifestPath);
  assert.ok((benchmark?.stats?.benchmarkPairCount || 0) > 0, "Benchmark pair count must be > 0.");
  assert.equal(typeof model?.qualityGate?.passed, "boolean", "Model quality gate result missing.");

  console.log(
    JSON.stringify(
      {
        ok: true,
        benchmarkRunId: benchmark.runId,
        modelRunId: model.runId,
        qualityGatePassed: model.qualityGate.passed,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(`[test:integration] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
