import path from "path";

const SANDBOX_DIR = path.resolve(process.cwd(), "sandbox");

console.log(SANDBOX_DIR)
export function resolveSafePath(userPath: string): string {
  const resolved = path.resolve(SANDBOX_DIR, userPath);
  if (!resolved.startsWith(SANDBOX_DIR)) {
    throw new Error("Access denied: path escapes the sandbox directory");
  }
  return resolved;
}