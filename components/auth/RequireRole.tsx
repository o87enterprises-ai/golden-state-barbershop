"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { homeFor, useAuth } from "@/lib/auth/AuthStore";
import { Role } from "@/lib/mock/data";
import { Spinner } from "./ui";

// Gate for the customer and staff apps. Signed-out visitors go to /login,
// un-onboarded accounts finish onboarding, and the wrong role is sent home.
export default function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { ready, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = !!user && user.onboarded && roles.includes(user.role);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!user.onboarded) router.replace("/onboarding");
    else if (!roles.includes(user.role)) router.replace(homeFor(user));
  }, [ready, user, roles, router, pathname]);

  if (!allowed) return <Spinner label="Checking your account…" />;
  return <>{children}</>;
}
