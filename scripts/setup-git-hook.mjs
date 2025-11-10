import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

/**
 * @typedef {Error & {
 *   status?: number,
 *   signal?: string,
 *   stdout?: Buffer | string,
 *   stderr?: Buffer | string
 * }} ExecError
 */

const gitDir = join(process.cwd(), ".git");

if (!existsSync(gitDir)) {
  console.log("No .git directory found, skipping lefthook installation");
  process.exit(0);
}

try {
  execSync("lefthook install", { stdio: "inherit" });
} catch (caughtError) {
  /** @type {ExecError} */
  const error = caughtError;

  console.error("Lefthook installation failed:");
  if (error.status) process.exit(error.status);
  else process.exit(1);
}
