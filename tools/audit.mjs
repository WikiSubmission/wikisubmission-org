#!/usr/bin/env node
/**
 * Workspace security audit over pnpm-lock.yaml.
 *
 * Why this exists instead of `pnpm audit`:
 *
 * For a request payload the size of this workspace, registry.npmjs.org returns
 * a gzip-compressed response body but omits the `Content-Encoding: gzip`
 * header. Any spec-compliant client therefore hands the raw deflate stream to
 * a JSON parser and dies with:
 *
 *     Unexpected token '\x1f', "\x1f\x8b\b..." is not valid JSON
 *
 * Reproduced both with and without an explicit `Accept-Encoding: gzip` request
 * header, and with a trivial payload (which comes back as plain JSON) versus
 * the real one (which does not) — so the trigger is response size and the bug
 * is server-side. No pnpm version or setting avoids it, and `npm audit` fails
 * the same way. This script sniffs the gzip magic bytes and inflates when the
 * header is missing.
 *
 * It also improves on `pnpm audit` in two ways that matter here:
 *
 *   - It queries every installed version of a package, not one. The legacy
 *     /audits endpoint takes a flat name->version map, so with three
 *     brace-expansion majors installed side by side it would silently check
 *     only one of them.
 *   - It separates runtime from dev-only findings by walking the dependency
 *     graph from each workspace's prod roots, so build-time-only exposure
 *     (eslint, redocly, and friends) is not ranked next to shipped code.
 *
 * Usage:
 *   node tools/audit.mjs [--audit-level=low|moderate|high|critical]
 *                          [--prod] [--json]
 *
 * Exits 1 if any finding at or above --audit-level survives the filters.
 */

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");
const semver = require("semver");

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const BULK_ENDPOINT =
  "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk";
const SEVERITIES = ["info", "low", "moderate", "high", "critical"];
const CHUNK_SIZE = 200;

function parseArgs(argv) {
  const level =
    argv.find((a) => a.startsWith("--audit-level="))?.split("=")[1] ?? "low";
  if (!SEVERITIES.includes(level)) {
    throw new Error(
      `--audit-level must be one of ${SEVERITIES.join(", ")} (got "${level}")`,
    );
  }
  return {
    level,
    prodOnly: argv.includes("--prod"),
    json: argv.includes("--json"),
  };
}

/**
 * Split a pnpm id ("@scope/pkg@1.2.3(peer@1)") into name and bare version.
 *
 * The peer suffix must be stripped BEFORE looking for the version separator:
 * peer ids contain their own "@" (e.g. "next@16.2.12(@babel/core@7.29.7)"), so
 * searching the raw string from the right lands inside the parentheses.
 */
export function splitId(id) {
  const bare = id.replace(/\(.*$/, "");
  const at = bare.lastIndexOf("@");
  if (at <= 0) return null;
  const name = bare.slice(0, at);
  const version = bare.slice(at + 1);
  return /^\d/.test(version) ? { name, version } : null;
}

/** Every distinct version of every package present in the lockfile. */
export function collectInstalled(lock) {
  const installed = new Map();
  for (const id of Object.keys(lock.packages ?? {})) {
    const parsed = splitId(id);
    if (!parsed) continue;
    if (!installed.has(parsed.name)) installed.set(parsed.name, new Set());
    installed.get(parsed.name).add(parsed.version);
  }
  return installed;
}

/**
 * Snapshot ids reachable from the prod dependencies of any workspace project.
 * Dev-only packages are everything in the lockfile that this never reaches.
 */
export function collectProdIds(lock) {
  const reached = new Set();
  const queue = [];

  const enqueue = (name, version) => {
    if (typeof version !== "string" || version.startsWith("link:")) return;
    const id = `${name}@${version}`;
    if (!reached.has(id)) {
      reached.add(id);
      queue.push(id);
    }
  };

  for (const importer of Object.values(lock.importers ?? {})) {
    for (const block of ["dependencies", "optionalDependencies"]) {
      for (const [name, entry] of Object.entries(importer[block] ?? {})) {
        enqueue(name, entry.version);
      }
    }
  }

  while (queue.length) {
    const snapshot = lock.snapshots?.[queue.pop()];
    if (!snapshot) continue;
    for (const block of ["dependencies", "optionalDependencies"]) {
      for (const [name, version] of Object.entries(snapshot[block] ?? {})) {
        enqueue(name, version);
      }
    }
  }

  return reached;
}

/** Bare name@version set for the prod graph, for cheap membership tests. */
export function toProdVersions(prodIds) {
  const prod = new Set();
  for (const id of prodIds) {
    const parsed = splitId(id);
    if (parsed) prod.add(`${parsed.name}@${parsed.version}`);
  }
  return prod;
}

function chunk(entries, size) {
  const out = [];
  for (let i = 0; i < entries.length; i += size)
    out.push(entries.slice(i, i + size));
  return out;
}

/**
 * POST to the registry and parse the body, working around the missing
 * Content-Encoding header described at the top of this file.
 */
async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let buf = Buffer.from(await res.arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);
  const text = buf.toString("utf8");
  if (!res.ok)
    throw new Error(`registry returned ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `registry returned unparseable body: ${text.slice(0, 300)}`,
    );
  }
}

async function fetchAdvisories(installed) {
  const payloadEntries = [...installed].map(([name, versions]) => [
    name,
    [...versions],
  ]);
  const advisories = {};
  for (const group of chunk(payloadEntries, CHUNK_SIZE)) {
    const result = await postJson(BULK_ENDPOINT, Object.fromEntries(group));
    for (const [name, list] of Object.entries(result)) {
      advisories[name] = (advisories[name] ?? []).concat(list);
    }
  }
  return advisories;
}

/**
 * The bulk endpoint returns advisories affecting *any* submitted version but
 * does not say which, so match each installed version locally.
 */
export function buildFindings(advisories, installed, prodVersions) {
  const findings = [];
  for (const [name, list] of Object.entries(advisories)) {
    for (const advisory of list) {
      const affected = [...(installed.get(name) ?? [])]
        .filter((v) =>
          semver.satisfies(v, advisory.vulnerable_versions, {
            includePrerelease: true,
          }),
        )
        .sort(semver.compare);
      if (!affected.length) continue;
      findings.push({
        name,
        severity: advisory.severity,
        installed: affected,
        vulnerable: advisory.vulnerable_versions,
        // The bulk endpoint does not return patched_versions; the advisory URL
        // carries the fix. Do not invent one by mutating the vulnerable range.
        cvss: advisory.cvss?.score,
        title: advisory.title,
        url: advisory.url,
        scope: affected.some((v) => prodVersions.has(`${name}@${v}`))
          ? "runtime"
          : "dev",
      });
    }
  }
  const rank = (f) => SEVERITIES.indexOf(f.severity);
  return findings.sort(
    (a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name),
  );
}

// Counted per advisory-and-version pair so totals line up with what `pnpm audit`
// reports; one advisory spanning two installed majors counts as two.
const countPairs = (list) => list.reduce((n, f) => n + f.installed.length, 0);

export function gatingFindings(findings, { level, prodOnly }) {
  const threshold = SEVERITIES.indexOf(level);
  return findings.filter(
    (f) =>
      SEVERITIES.indexOf(f.severity) >= threshold &&
      (!prodOnly || f.scope === "runtime"),
  );
}

function report(findings, { level, prodOnly }) {
  if (!findings.length) {
    console.log("No known advisories affect any installed version.");
    return 0;
  }

  // In --prod mode the dev-only findings are suppressed, so every count below
  // describes the shown set rather than the whole lockfile.
  const shown = prodOnly
    ? findings.filter((f) => f.scope === "runtime")
    : findings;
  const suppressed = findings.length - shown.length;

  for (const f of shown) {
    const cvss = f.cvss ? `  cvss ${f.cvss}` : "";
    console.log(`${f.severity.toUpperCase()}  ${f.name}  [${f.scope}]${cvss}`);
    console.log(`  installed: ${f.installed.join(", ")}`);
    console.log(`  vulnerable: ${f.vulnerable}`);
    console.log(`  ${f.title}`);
    if (f.url) console.log(`  ${f.url}`);
    console.log();
  }

  if (!shown.length) {
    console.log(
      `No runtime-scope findings. ${countPairs(findings)} dev-only finding(s) hidden by --prod.`,
    );
    return 0;
  }

  const counts = SEVERITIES.map((s) => [
    s,
    countPairs(shown.filter((f) => f.severity === s)),
  ])
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${s}`)
    .join(", ");
  console.log(
    `${countPairs(shown)} finding(s) across ${shown.length} advisor${shown.length === 1 ? "y" : "ies"}: ${counts}`,
  );

  const dev = shown.filter((f) => f.scope === "dev");
  if (dev.length) {
    console.log(
      `${countPairs(dev)} are dev-only (build-time, not shipped to users).`,
    );
  }
  if (suppressed)
    console.log(`${suppressed} dev-only advisor(ies) hidden by --prod.`);

  const gating = gatingFindings(findings, { level, prodOnly });
  if (gating.length) {
    console.log(
      `\n${countPairs(gating)} at or above "${level}"${prodOnly ? " in runtime scope" : ""}.`,
    );
  }
  return gating.length ? 1 : 0;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const lock = yaml.load(
    readFileSync(path.join(REPO_ROOT, "pnpm-lock.yaml"), "utf8"),
  );
  if (!lock?.packages)
    throw new Error("pnpm-lock.yaml has no packages section");

  const installed = collectInstalled(lock);
  const prodVersions = toProdVersions(collectProdIds(lock));
  const advisories = await fetchAdvisories(installed);
  const findings = buildFindings(advisories, installed, prodVersions);

  const gating = gatingFindings(findings, opts);

  if (opts.json) {
    console.log(JSON.stringify({ findings, gating: gating.length }, null, 2));
    return gating.length ? 1 : 0;
  }

  console.log(
    `Auditing ${installed.size} packages (${prodVersions.size} in runtime scope) from pnpm-lock.yaml\n`,
  );
  return report(findings, opts);
}

// Only run when invoked directly, so the pure helpers above stay importable.
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(`audit failed: ${err.message}`);
      process.exit(2);
    },
  );
}
