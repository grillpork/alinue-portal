/** Absolute URL on the storefront (alinue-frontend), used by "open in shop" actions. */
export function storefrontUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_CLIENT_URL ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
