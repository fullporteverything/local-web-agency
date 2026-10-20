/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crm from "../crm.js";
import type * as http from "../http.js";
import type * as inbound from "../inbound.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as lib_pricing from "../lib/pricing.js";
import type * as portal from "../portal.js";
import type * as seed from "../seed.js";
import type * as showcase from "../showcase.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crm: typeof crm;
  http: typeof http;
  inbound: typeof inbound;
  "lib/access": typeof lib_access;
  "lib/helpers": typeof lib_helpers;
  "lib/pricing": typeof lib_pricing;
  portal: typeof portal;
  seed: typeof seed;
  showcase: typeof showcase;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
