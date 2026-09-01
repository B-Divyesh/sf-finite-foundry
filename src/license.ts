const SLUG = 'finite-foundry';
const LICENSE_KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `sb_license_cache:${SLUG}`;
const DAY_MS = 86_400_000;

interface CacheVerdict {
  valid: boolean;
  checkedAt: number;
}

export type LicenseStatus = 'locked' | 'checking' | 'unlocked' | 'inactive';

let status: LicenseStatus = 'locked';

function readCache(): CacheVerdict | null {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    return value ? JSON.parse(value) as CacheVerdict : null;
  } catch {
    return null;
  }
}

function storeVerdict(valid: boolean): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ valid, checkedAt: Date.now() }));
}

async function verify(token: string): Promise<boolean> {
  const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('The license service did not respond.');
  const result = await response.json() as { valid?: boolean };
  return result.valid === true;
}

export function getLicenseStatus(): LicenseStatus {
  return status;
}

export async function initializeLicense(onChange: () => void, isDemo: boolean): Promise<void> {
  if (isDemo) return;
  const url = new URL(location.href);
  const returnedToken = url.searchParams.get('license');
  if (returnedToken) {
    localStorage.setItem(LICENSE_KEY, returnedToken);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  const token = returnedToken ?? localStorage.getItem(LICENSE_KEY);
  if (!token) return;
  const cached = readCache();
  if (cached?.valid) status = 'unlocked';
  if (cached && Date.now() - cached.checkedAt < DAY_MS) {
    status = cached.valid ? 'unlocked' : 'inactive';
    onChange();
    return;
  }
  status = cached?.valid ? 'unlocked' : 'checking';
  onChange();
  try {
    const valid = await verify(token);
    status = valid ? 'unlocked' : 'inactive';
    storeVerdict(valid);
  } catch {
    status = cached?.valid ? 'unlocked' : 'checking';
  }
  onChange();
}

export async function restoreLicense(token: string): Promise<LicenseStatus> {
  if (!token.trim()) return status;
  status = 'checking';
  localStorage.setItem(LICENSE_KEY, token.trim());
  try {
    const valid = await verify(token.trim());
    status = valid ? 'unlocked' : 'inactive';
    storeVerdict(valid);
  } catch {
    status = 'checking';
  }
  return status;
}

