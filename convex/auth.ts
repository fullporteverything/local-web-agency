import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { ownerEmail } from "./lib/access";

// Magic-link login for the owner (CRM) and clients (portal).
// Only the owner's email and emails of paying clients can create an account.

const MagicLink = Email({
  id: "email",
  maxAge: 60 * 60, // links expire after an hour
  authorize: undefined, // the link alone signs you in
  async sendVerificationRequest({ identifier: email, url }) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      // Local development without email set up: the link shows in the Convex logs.
      console.log(`[dev] login link for ${email}: ${url}`);
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM ?? "Login <onboarding@resend.dev>",
        to: email,
        subject: "Your login link",
        text: `Here's your login link. It works once and expires in an hour.\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
      }),
    });
    if (!res.ok) throw new ConvexError(`Couldn't send the login email (${res.status}).`);
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [MagicLink],
  callbacks: {
    async createOrUpdateUser(rawCtx, args) {
      const ctx = rawCtx as unknown as MutationCtx;
      const email = String(args.profile.email ?? "").trim().toLowerCase();
      if (args.existingUserId) return args.existingUserId;
      const existing = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).first();
      if (existing) return existing._id;
      const isOwner = email !== "" && email === ownerEmail();
      const client = await ctx.db.query("clients").withIndex("by_email", (q) => q.eq("email", email)).first();
      if (!isOwner && !client) throw new ConvexError("There's no account for that email.");
      const userId = await ctx.db.insert("users", { email, emailVerificationTime: Date.now() });
      if (client) await ctx.db.patch(client._id, { userId });
      return userId;
    },
  },
});
