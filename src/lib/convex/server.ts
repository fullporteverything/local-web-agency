import "server-only";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";

// Server-side Convex access for Server Components, Server Actions, and Route Handlers.
// Calls carry the signed-in user's token, so Convex's access rules apply.

export function isConvexConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export async function query<Q extends FunctionReference<"query">>(fn: Q, args: FunctionArgs<Q>): Promise<FunctionReturnType<Q>> {
  return fetchQuery(fn, args, { token: await convexAuthNextjsToken() });
}

export async function mutate<M extends FunctionReference<"mutation">>(fn: M, args: FunctionArgs<M>): Promise<FunctionReturnType<M>> {
  return fetchMutation(fn, args, { token: await convexAuthNextjsToken() });
}

/** Public calls that don't need a signed-in user (website forms, showcase). */
export const publicQuery = <Q extends FunctionReference<"query">>(fn: Q, args: FunctionArgs<Q>) => fetchQuery(fn, args);
export const publicMutation = <M extends FunctionReference<"mutation">>(fn: M, args: FunctionArgs<M>) => fetchMutation(fn, args);

/** Turns a Convex error into a sentence safe to show the user. */
export function errorMessage(e: unknown) {
  if (e instanceof ConvexError) return typeof e.data === "string" ? e.data : "That didn't work.";
  console.error(e);
  return "Something went wrong. Try again in a moment.";
}
