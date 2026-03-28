export interface Organization {
  id: string;
  name: string;
  logoUrl?: string | null;
  description: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  isActive: boolean;
  createdAt: Date;
}

export interface SearchResult {
  summary: string;
  organizations: Organization[];
}

export interface TempUser {
  id: string;
  name?: string | null;
  email: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
}
