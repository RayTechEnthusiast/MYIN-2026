"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import { StudentApp } from "./StudentApp";
import { OrganizationApp } from "./OrganizationApp";

export function DashboardRouter() {
  const { ready, session } = useApp();
  const router = useRouter();
  useEffect(() => { if (ready && !session) router.replace("/auth?mode=login"); }, [ready, session, router]);
  if (!ready || !session) return <div className="loading-screen"><span className="spinner" />Loading MYIN…</div>;
  return session.role === "student" ? <StudentApp /> : <OrganizationApp />;
}
