/**
 * Tests for tools/audit.mjs. Run with `pnpm audit:test` (node --test).
 *
 * Uses Node's built-in test runner so the audit tooling stays dependency-free
 * and runnable at the workspace root, where there is no vitest project.
 *
 * Everything here is offline: the pure helpers are exercised against synthetic
 * lockfile fixtures, plus the real pnpm-lock.yaml for scope spot-checks. No
 * registry calls.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

import {
  splitId,
  collectInstalled,
  collectProdIds,
  toProdVersions,
  buildFindings,
  gatingFindings,
} from "./audit.mjs";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

test("splitId strips peer suffixes before finding the version separator", () => {
  // Regression: lastIndexOf('@') on the raw id lands inside the peer suffix,
  // which silently corrupted every id carrying a scoped peer.
  assert.deepEqual(splitId("next@16.2.12(@babel/core@7.29.7)(react@19.2.7)"), {
    name: "next",
    version: "16.2.12",
  });
  assert.deepEqual(splitId("@scope/pkg@1.2.3(peer@1.0.0)"), {
    name: "@scope/pkg",
    version: "1.2.3",
  });
  assert.deepEqual(splitId("brace-expansion@5.0.8"), {
    name: "brace-expansion",
    version: "5.0.8",
  });
  assert.deepEqual(splitId("@auth/core@0.41.3"), {
    name: "@auth/core",
    version: "0.41.3",
  });
});

test("splitId rejects ids without a numeric version", () => {
  assert.equal(splitId("shared@link:../../packages/shared"), null);
  assert.equal(splitId("@scope/pkg@workspace:*"), null);
  assert.equal(splitId("nonsense"), null);
});

test("collectInstalled keeps every major of a package, not just the last", () => {
  const installed = collectInstalled({
    packages: {
      "brace-expansion@1.1.16": {},
      "brace-expansion@2.1.2": {},
      "brace-expansion@5.0.8": {},
      "tar@7.5.19": {},
    },
  });
  assert.deepEqual([...installed.get("brace-expansion")].sort(), [
    "1.1.16",
    "2.1.2",
    "5.0.8",
  ]);
  assert.deepEqual([...installed.get("tar")], ["7.5.19"]);
});

test("collectProdIds reaches prod transitives and excludes dev-only ones", () => {
  const lock = {
    importers: {
      ".": {
        dependencies: { app: { version: "1.0.0" } },
        devDependencies: { linter: { version: "9.0.0" } },
      },
    },
    snapshots: {
      "app@1.0.0": { dependencies: { helper: "2.0.0" } },
      "helper@2.0.0": { dependencies: { deep: "3.0.0" } },
      "deep@3.0.0": {},
      "linter@9.0.0": { dependencies: { "linter-dep": "4.0.0" } },
      "linter-dep@4.0.0": {},
    },
  };
  const prod = toProdVersions(collectProdIds(lock));
  assert.ok(prod.has("app@1.0.0"));
  assert.ok(prod.has("helper@2.0.0"));
  assert.ok(prod.has("deep@3.0.0"), "transitive prod deps must be reached");
  assert.ok(!prod.has("linter@9.0.0"), "devDependencies are not prod roots");
  assert.ok(
    !prod.has("linter-dep@4.0.0"),
    "dev transitives stay out of prod scope",
  );
});

test("collectProdIds follows optionalDependencies (how sharp reaches prod)", () => {
  const lock = {
    importers: { ".": { dependencies: { next: { version: "16.2.12" } } } },
    snapshots: {
      "next@16.2.12": { optionalDependencies: { sharp: "0.35.3" } },
      "sharp@0.35.3": {},
    },
  };
  const prod = toProdVersions(collectProdIds(lock));
  assert.ok(prod.has("sharp@0.35.3"));
});

test("collectProdIds does not follow workspace links as versions", () => {
  const lock = {
    importers: {
      ".": { dependencies: { shared: { version: "link:../packages/shared" } } },
    },
    snapshots: {},
  };
  assert.equal(collectProdIds(lock).size, 0);
});

test("collectProdIds terminates on cyclic dependency graphs", () => {
  const lock = {
    importers: { ".": { dependencies: { a: { version: "1.0.0" } } } },
    snapshots: {
      "a@1.0.0": { dependencies: { b: "1.0.0" } },
      "b@1.0.0": { dependencies: { a: "1.0.0" } },
    },
  };
  const prod = toProdVersions(collectProdIds(lock));
  assert.deepEqual([...prod].sort(), ["a@1.0.0", "b@1.0.0"]);
});

test("buildFindings matches only the installed versions in the advisory range", () => {
  const installed = new Map([
    ["brace-expansion", new Set(["1.1.16", "2.1.2", "5.0.8"])],
  ]);
  const advisories = {
    "brace-expansion": [
      {
        severity: "high",
        vulnerable_versions: "<=5.0.7",
        title: "DoS",
        url: "u",
        cvss: { score: 7.5 },
      },
    ],
  };
  const [finding] = buildFindings(advisories, installed, new Set());
  // 5.0.8 is outside the range; 1.1.16 and 2.1.2 are numerically inside it.
  assert.deepEqual(finding.installed, ["1.1.16", "2.1.2"]);
  assert.equal(finding.severity, "high");
  assert.equal(finding.cvss, 7.5);
});

test("buildFindings drops advisories no installed version satisfies", () => {
  const installed = new Map([["tar", new Set(["7.5.21"])]]);
  const advisories = {
    tar: [
      { severity: "moderate", vulnerable_versions: "<=7.5.20", title: "t" },
    ],
  };
  assert.deepEqual(buildFindings(advisories, installed, new Set()), []);
});

test("buildFindings labels scope from the prod graph", () => {
  const installed = new Map([
    ["sharp", new Set(["0.34.5"])],
    ["tar", new Set(["7.5.19"])],
  ]);
  const advisories = {
    sharp: [{ severity: "high", vulnerable_versions: "<0.35.0", title: "s" }],
    tar: [
      { severity: "moderate", vulnerable_versions: "<=7.5.20", title: "t" },
    ],
  };
  const findings = buildFindings(
    advisories,
    installed,
    new Set(["sharp@0.34.5"]),
  );
  assert.equal(findings.find((f) => f.name === "sharp").scope, "runtime");
  assert.equal(findings.find((f) => f.name === "tar").scope, "dev");
});

test("buildFindings sorts most severe first", () => {
  const installed = new Map([
    ["a", new Set(["1.0.0"])],
    ["b", new Set(["1.0.0"])],
  ]);
  const advisories = {
    a: [{ severity: "moderate", vulnerable_versions: "1.0.0", title: "a" }],
    b: [{ severity: "critical", vulnerable_versions: "1.0.0", title: "b" }],
  };
  assert.deepEqual(
    buildFindings(advisories, installed, new Set()).map((f) => f.severity),
    ["critical", "moderate"],
  );
});

test("gatingFindings honours severity threshold and --prod", () => {
  const findings = [
    { severity: "high", scope: "dev", installed: ["1.0.0"] },
    { severity: "moderate", scope: "runtime", installed: ["1.0.0"] },
  ];
  assert.equal(
    gatingFindings(findings, { level: "low", prodOnly: false }).length,
    2,
  );
  assert.equal(
    gatingFindings(findings, { level: "high", prodOnly: false }).length,
    1,
  );
  assert.equal(
    gatingFindings(findings, { level: "high", prodOnly: true }).length,
    0,
  );
  assert.equal(
    gatingFindings(findings, { level: "low", prodOnly: true }).length,
    1,
  );
});

test("the real lockfile classifies known runtime and dev packages correctly", () => {
  const lock = yaml.load(
    readFileSync(path.join(REPO_ROOT, "pnpm-lock.yaml"), "utf8"),
  );
  const installed = collectInstalled(lock);
  const prod = toProdVersions(collectProdIds(lock));
  const reachable = (name) =>
    [...(installed.get(name) ?? [])].some((v) => prod.has(`${name}@${v}`));

  assert.ok(
    installed.size > 100,
    "lockfile should yield a substantial package set",
  );
  for (const name of [
    "next",
    "react",
    "react-dom",
    "sharp",
    "next-auth",
    "@auth/core",
  ]) {
    assert.ok(reachable(name), `${name} should be in runtime scope`);
  }
  for (const name of ["eslint", "vitest", "@capacitor/cli", "react-scan"]) {
    assert.ok(!reachable(name), `${name} should be dev-only`);
  }
});
