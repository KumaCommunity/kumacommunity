export const contentLicense = {
  name: 'CC BY-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  spdx: 'CC-BY-SA-4.0',
} as const;

type LicenseNotice = {
  name?: string;
  url?: string;
  notice?: string;
  isDefault: boolean;
};

/** Resolve article front matter without guessing a license for invalid input. */
export function resolveContentLicense(value: unknown): LicenseNotice | null {
  if (value === false) return null;
  if (value === undefined || value === contentLicense.spdx) {
    return {...contentLicense, isDefault: true};
  }

  const invalid = () => {
    throw new Error(
      'Invalid content_license: use CC-BY-SA-4.0, false, an object with name and absolute HTTP(S) url, or an object with notice text.',
    );
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  const entry = value as Record<string, unknown>;
  if (Object.keys(entry).some((key) => !['name', 'url', 'notice'].includes(key))) return invalid();
  for (const field of ['name', 'url', 'notice']) {
    if (entry[field] !== undefined && (typeof entry[field] !== 'string' || !entry[field].trim())) {
      return invalid();
    }
  }
  const {name, url, notice} = entry as {name?: string; url?: string; notice?: string};
  if (name === undefined && url === undefined && notice) return {notice, isDefault: false};
  if (!name || !url) return invalid();
  try {
    if (!['http:', 'https:'].includes(new URL(url).protocol)) return invalid();
  } catch {
    return invalid();
  }
  return {name, url, notice, isDefault: false};
}
