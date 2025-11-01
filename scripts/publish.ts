/** biome-ignore-all assist: <fix these later> */
/** biome-ignore-all lint: <fix these later> */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";

type PkgJson = {
  name: string;
  version: string;
  private?: boolean;
  publishConfig?: { access?: "public" | "restricted" };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const ROOT = path.resolve(process.cwd());
const PACKAGES_DIR = path.resolve(ROOT, "packages");

const args = new Set(process.argv.slice(2));
const isDryRun = args.has("--dry");
const bumpArg = [...args].find((a) => a === "--bump" || a.startsWith("--bump=")) ?? "";
const bumpType = bumpArg.includes("=") ? (bumpArg.split("=")[1] as "patch" | "minor" | "major") : "patch";

const log = (...m: any[]) => console.log("[publish]", ...m);
const warn = (...m: any[]) => console.warn("[publish]", ...m);

const readJson = async <T = any>(p: string): Promise<T> => JSON.parse((await readFile(p, "utf8")) as any);
const writeJson = async (p: string, data: any) => writeFile(p, `${JSON.stringify(data, null, 2)}\n`, "utf8");

type Pkg = {
  dir: string;
  jsonPath: string;
  pkg: PkgJson;
  changed: boolean;
  beforeVersion: string;
  afterVersion: string;
};

// Discover immediate child packages
async function discoverPackages(): Promise<Pkg[]> {
  const entries = await readdir(PACKAGES_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => path.join(PACKAGES_DIR, e.name));
  const pkgs: Pkg[] = [];
  for (const dir of dirs) {
    const jsonPath = path.join(dir, "package.json");
    try {
      const st = await stat(jsonPath);
      if (!st.isFile()) {
        continue;
      }
      const pkg = await readJson<PkgJson>(jsonPath);
      if (pkg.private) {
        log("skip private", pkg.name);
        continue;
      }
      pkgs.push({
        dir,
        jsonPath,
        pkg,
        changed: false,
        beforeVersion: pkg.version,
        afterVersion: pkg.version,
      });
    } catch {
      // ignore non-package folders
    }
  }
  return pkgs;
}

async function hasGitChanges(dir: string): Promise<boolean> {
  // Ensure we're inside a git work tree
  const inside = await $`git -C ${dir} rev-parse --is-inside-work-tree`.nothrow();
  if (inside.exitCode !== 0 || String(inside.stdout).trim() !== "true") {
    return false;
  }

  // If no commits yet, HEAD won't exist; detect untracked files
  const head = await $`git -C ${dir} rev-parse --verify HEAD`.nothrow();
  if (head.exitCode !== 0) {
    const untracked = await $`git -C ${dir} ls-files --others --exclude-standard`.nothrow();
    return String(untracked.stdout).trim().length > 0;
  }

  // Fast path: porcelain shows staged/unstaged + untracked (??)
  const status = await $`git -C ${dir} status --porcelain`.nothrow();
  return String(status.stdout).trim().length > 0;
}

async function bumpWithBumpp(dir: string, level: "patch" | "minor" | "major"): Promise<void> {
  log("bumpp", level, "in", path.basename(dir));
  if (isDryRun) return;
  const cmd = `cd ${dir} && bunx bumpp ${level} --no-commit --no-tag --no-push --yes`;
  const r = await $`bash -lc ${cmd}`.nothrow();
  if (r.exitCode !== 0) {
    throw new Error(`bumpp failed in ${dir}: ${r.stderr?.toString() || r.stdout?.toString()}`);
  }
}

function updateRange(existing: string | undefined, newVersion: string): string {
  if (!existing) return `^${newVersion}`;
  // Preserve leading operator if present (^, ~)
  const m = existing.match(/^([\^~])\s*\d/);
  const op = m?.[1] ?? "^";
  return `${op}${newVersion}`;
}

async function main() {
  log("Scanning", PACKAGES_DIR);
  const pkgs = await discoverPackages();
  if (!pkgs.length) {
    warn("No public packages found in", PACKAGES_DIR);
    return;
  }

  // Build name -> pkg map
  const byName = new Map<string, Pkg>();
  pkgs.forEach((p) => byName.set(p.pkg.name, p));

  // 1) Detect changes and bump those first
  for (const p of pkgs) {
    const changed = await hasGitChanges(p.dir);
    p.changed = changed;
    if (changed) {
      // Run bun build before bumping
      log("building", path.basename(p.dir));
      const buildCmd = `cd ${p.dir} && bun build src --outdir dist`;
      if (isDryRun) {
        log("(dry)", buildCmd);
      } else {
        const buildResult = await $`bash -lc ${buildCmd}`.nothrow();
        if (buildResult.exitCode !== 0) {
          throw new Error(
            `Build failed in ${p.dir}: ${buildResult.stderr?.toString() || buildResult.stdout?.toString()}`
          );
        }
      }

      await bumpWithBumpp(p.dir, bumpType);
      // reload version
      p.pkg = await readJson<PkgJson>(p.jsonPath);
      p.afterVersion = p.pkg.version;
    }
  }

  // 2) Propagate dependency bumps to dependants
  //    If a local dependency was bumped, update dependants' package.json and bump them (patch)
  const queue = [...pkgs.filter((p) => p.beforeVersion !== p.afterVersion)];
  const changedNames = new Set(queue.map((p) => p.pkg.name));

  let propagated = true;
  while (propagated) {
    propagated = false;
    for (const dependant of pkgs) {
      // Skip if private (already filtered) or it’s the one already changed
      const depJson = dependant.pkg;
      let mutated = false;
      const sections: (keyof PkgJson)[] = ["dependencies", "devDependencies", "peerDependencies"];
      for (const sec of sections) {
        const rec = depJson[sec as "dependencies"] as Record<string, string> | undefined;
        if (!rec) continue;
        for (const depName of Object.keys(rec)) {
          const localDep = byName.get(depName);
          if (!localDep) continue; // not internal
          const wantedRange = rec[depName];
          const newRange = updateRange(wantedRange, localDep.afterVersion);
          if (newRange !== wantedRange) {
            rec[depName] = newRange;
            mutated = true;
          }
        }
      }
      if (mutated) {
        propagated = true;
        if (!isDryRun) {
          await writeJson(dependant.jsonPath, depJson);
        }
        // bump dependant patch if not already bumped in this run
        if (dependant.beforeVersion === dependant.afterVersion) {
          await bumpWithBumpp(dependant.dir, "patch");
          dependant.pkg = await readJson<PkgJson>(dependant.jsonPath);
          dependant.afterVersion = dependant.pkg.version;
          changedNames.add(dependant.pkg.name);
        }
      }
    }
  }

  // 3) Publish all packages whose version changed
  const toPublish = pkgs.filter((p) => p.beforeVersion !== p.afterVersion);
  if (!toPublish.length) {
    log("No version changes detected. Nothing to publish.");
    return;
  }

  log("Will publish:", toPublish.map((p) => `${p.pkg.name}@${p.afterVersion}`).join(", "));
  for (const p of toPublish) {
    const cmd = `cd ${p.dir} && npm publish --access public`;
    if (isDryRun) {
      log("(dry) ", cmd);
      continue;
    }
    const r = await $`bash -lc ${cmd}`.nothrow();
    if (r.exitCode !== 0) {
      throw new Error(`publish failed for ${p.pkg.name}: ${r.stderr?.toString() || r.stdout?.toString()}`);
    }
    log("published", `${p.pkg.name}@${p.afterVersion}`);
  }

  log("Done.");
}

main().catch((e) => {
  console.error("[publish] ERROR:", e);
  process.exit(1);
});
