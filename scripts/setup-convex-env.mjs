// One-time setup of the environment variables Convex needs, for the current Convex deployment.
//   node scripts/setup-convex-env.mjs --owner you@youragency.com --site https://youragency.com [--prod]
// It creates fresh login-signing keys and a random INBOUND_SECRET (printed so you can add it to Vercel).
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const owner = arg("owner");
const site = arg("site") ?? "http://localhost:3000";
const prod = process.argv.includes("--prod");
if (!owner) {
  console.error("Usage: node scripts/setup-convex-env.mjs --owner you@youragency.com --site https://youragency.com [--prod]");
  process.exit(1);
}

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const jwks = JSON.stringify({ keys: [{ use: "sig", ...(await exportJWK(keys.publicKey)) }] });
const inboundSecret = randomBytes(24).toString("hex");

const set = (name, value) => {
  execFileSync("npx", ["convex", "env", "set", ...(prod ? ["--prod"] : []), "--", name, value], { stdio: ["ignore", "ignore", "inherit"] });
  console.log(`set ${name}`);
};
set("JWT_PRIVATE_KEY", privateKey);
set("JWKS", jwks);
set("SITE_URL", site);
set("OWNER_EMAIL", owner.toLowerCase());
set("INBOUND_SECRET", inboundSecret);

console.log(`\nAdd this to Vercel (and .env.local) so website forms reach Convex:\nINBOUND_SECRET=${inboundSecret}`);
