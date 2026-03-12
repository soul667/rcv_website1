const base = (() => {
  const raw = import.meta.env.BASE_URL ?? '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
})();

const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '');

export function getPublicUrl(relativePath: string) {
  return `${base}${trimLeadingSlash(relativePath)}`;
}

export function getAssetUrl(relativePath: string) {
  return getPublicUrl(`assets/${trimLeadingSlash(relativePath)}`);
}

export function getContentUrl(relativePath: string) {
  return getPublicUrl(`content/${trimLeadingSlash(relativePath)}`);
}
