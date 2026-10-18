import { get, ref, set, update } from 'firebase/database';
import { db } from './config';

export interface UserProfile {
  name: string;
  email: string;
  deviceId: string;
  tariff: number;
  createdAt: number;
  role: string;
  photoURL?: string | null;
}

export const DEFAULT_DEVICE_ID = 'device001';
export const DEFAULT_TARIFF = 7.5;

export function profileRef(uid: string) {
  return ref(db, `Users/${uid}`);
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await get(profileRef(uid));
  if (!snap.exists()) return null;
  const raw = snap.val() as Partial<UserProfile>;
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    deviceId:
      typeof raw.deviceId === 'string' && raw.deviceId.trim().length > 0
        ? raw.deviceId.trim()
        : DEFAULT_DEVICE_ID,
    tariff: Number(raw.tariff) > 0 ? Number(raw.tariff) : DEFAULT_TARIFF,
    createdAt: Number(raw.createdAt) || Date.now(),
    role: typeof raw.role === 'string' ? raw.role : 'user',
    photoURL: typeof raw.photoURL === 'string' ? raw.photoURL : null,
  };
}

export async function saveUserProfile(
  uid: string,
  profile: UserProfile,
): Promise<void> {
  await set(profileRef(uid), profile);
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<UserProfile>,
): Promise<void> {
  await update(profileRef(uid), patch);
}

/**
 * Ensures a profile exists. Used after Google sign-in where the user may
 * be new and we have no deviceId/tariff from a form.
 */
export async function ensureUserProfile(
  uid: string,
  fallback: { name: string; email: string; photoURL?: string | null },
): Promise<UserProfile> {
  const existing = await loadUserProfile(uid);
  if (existing) return existing;
  const fresh: UserProfile = {
    name: fallback.name,
    email: fallback.email,
    deviceId: DEFAULT_DEVICE_ID,
    tariff: DEFAULT_TARIFF,
    createdAt: Date.now(),
    role: 'user',
    photoURL: fallback.photoURL ?? null,
  };
  await saveUserProfile(uid, fresh);
  return fresh;
}
