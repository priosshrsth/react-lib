/** biome-ignore-all lint/style/noMagicNumbers: <allow magic numbers> */
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { file, spawn } from "bun";

const RepoRoot = resolve(`${import.meta.dir}`, "../");

// ---- Types ----
interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  publishConfig?: {
    access?: "public" | "restricted";
    registry?: string;
    [k: string]: unknown;
  };
}

interface PkgInfo {
  name: string;
  version: string;
  dir: string; // absolute path
  hasPublishScript: boolean;
}

interface CliFlags {
  dry: boolean;
  verbose: boolean;
}

// ---- CLI Flags ----
const flags: CliFlags = (() => {
  const argv = new Set(process.argv.slice(2));
  return {
    dry: argv.has("--dry") || argv.has("--dry-run"),
    verbose: argv.has("--verbose") || argv.has("-v"),
  } as const;
})();

// ---- Helpers ----
const log = {
  info: (msg: string) => console.log(msg),
  warn: (msg: string) => console.warn(msg),
  error: (msg: string) => console.error(msg),
  verbose: (msg: string) => {
    if (flags.verbose) {
      console.log(msg);
    }
  },
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isPackageJson(x: unknown): x is PackageJson {
  if (!isRecord(x)) {
    return false;
  }
  // Minimal shape check
  const maybeName = x.name;
  const maybeVersion = x.version;
  const maybePrivate = x.private;
  return (
    (maybeName === undefined || typeof maybeName === "string") &&
    (maybeVersion === undefined || typeof maybeVersion === "string") &&
    (maybePrivate === undefined || typeof maybePrivate === "boolean")
  );
}

async function readPackageJson(pkgPath: string): Promise<PackageJson | null> {
  const packageJsonFile = file(`${pkgPath}/package.json`);
  if (!(await packageJsonFile.exists())) {
    return null;
  }
  try {
    const parsed = JSON.parse(await packageJsonFile.text()) as unknown;
    if (!isPackageJson(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function listImmediatePackageDirs(root: string): Promise<string[]> {
  return await readdir(root).then((data) => data.map((pkg) => `${RepoRoot}/packages/${pkg}`));
}

async function gatherPackages(packagesRoot: string): Promise<PkgInfo[]> {
  const packages = (await listImmediatePackageDirs(packagesRoot)) || [];
  const out: PkgInfo[] = [];
  for (const dir of packages) {
    const pkg = await readPackageJson(dir);
    if (!pkg) {
      log.verbose(`Skipping (no package.json): ${dir}`);
      continue;
    }
    if (pkg.private) {
      log.verbose(`Skipping private package: ${pkg.name ?? dir}`);
      continue;
    }
    if (!(pkg.name && pkg.version)) {
      log.warn(`Skipping (missing name/version): ${dir}`);
      continue;
    }
    const hasPublishScript = Boolean(pkg.scripts && Object.hasOwn(pkg.scripts, "publish"));
    out.push({ name: pkg.name, version: pkg.version, dir, hasPublishScript });
  }
  return out;
}

async function isPublished(name: string, version: string): Promise<boolean> {
  // Fast existence check: GET https://registry.npmjs.org/<name>/<version>
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
  try {
    const res = await fetch(url, { method: "GET" });
    if (res.status === 200) {
      return true;
    }
    if (res.status === 404) {
      return false;
    }
    // Other status codes: treat as unknown; be conservative and assume published=false
    log.warn(`Registry returned status ${res.status} for ${name}@${version}. Proceeding as not published.`);
    return false;
  } catch (err) {
    log.warn(`Failed to check registry for ${name}@${version}: ${(err as Error).message}`);
    return false;
  }
}

async function run(cmd: string[], cwd: string): Promise<number> {
  // Bun.spawn preserves strict typing and supports cwd
  const proc = spawn(cmd, { cwd, stdio: ["inherit", "inherit", "inherit"], env: { ...process.env } });
  return await proc.exited;
}

const tagRegex = /-(?<tag>[0-9A-Za-z-.]+)/;

function getPublishTag(version: string): string | null {
  const prereleaseMatch = version.match(tagRegex);
  if (!prereleaseMatch) {
    return null;
  }
  const tag = prereleaseMatch.groups?.tag?.split(".")[0] ?? "next";
  return tag || "next";
}

async function publishPackage(pkg: PkgInfo): Promise<{ success: boolean; code: number }> {
  log.info(`\n→ Publishing ${pkg.name}@${pkg.version}`);
  if (flags.dry) {
    log.info(`[dry-run] Would publish ${pkg.name}@${pkg.version} from ${pkg.dir}`);
    return { success: true, code: 0 };
  }

  // Prefer package's own publish script if present
  if (pkg.hasPublishScript) {
    log.verbose('Using package\'s "publish" script via Bun');
    const code = await run(["bun", "run", "publish"], pkg.dir);
    return { success: code === 0, code };
  }

  const tag = getPublishTag(pkg.version);

  const args = ["npm", "publish", "--access", "public"];
  if (tag) {
    log.verbose(`Detected prerelease version. Using tag "${tag}"`);
    args.push("--tag", tag);
  }
  const code = await run(args, pkg.dir);
  return { success: code === 0, code };
}

async function main(): Promise<void> {
  const packagesRoot = `${RepoRoot}/packages`;

  log.info(`Scanning: ${packagesRoot}`);
  const pkgs = await gatherPackages(packagesRoot);
  if (pkgs.length === 0) {
    log.info("No public packages found to process.");
    return;
  }

  log.info(`Found ${pkgs.length} candidate package(s).`);

  let publishedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const pkg of pkgs) {
    const exists = await isPublished(pkg.name, pkg.version);
    if (exists) {
      log.info(`✔ ${pkg.name}@${pkg.version} is already published. Skipping.`);
      skippedCount++;
      continue;
    }

    const { success, code } = await publishPackage(pkg);
    if (success) {
      log.info(`✅ Published ${pkg.name}@${pkg.version}`);
      publishedCount++;
    } else {
      log.error(`❌ Failed to publish ${pkg.name}@${pkg.version} (exit code ${code})`);
      failedCount++;
    }
  }

  log.info("\nSummary:");
  log.info(`  Published: ${publishedCount}`);
  log.info(`  Already published: ${skippedCount}`);
  log.info(`  Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

await main();
