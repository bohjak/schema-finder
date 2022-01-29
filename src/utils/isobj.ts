/**
 * Checks if prop is a non-empty, non-null object
 */
export const isObj = (prop?: unknown): prop is Record<string, unknown> =>
  prop !== null && typeof prop === "object" && !!Object.keys(prop).length;
