import type { Role } from "@/lib/mock/data";

export type Profile = {
  specialties?: string;
  bio?: string;
  privateRate?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
  onboarded: boolean;
  cutsHair?: boolean; // owner who also works the floor
  profile?: Profile;
};

export type Invite = { code: string; name: string; createdAt: string; usedBy?: string };
