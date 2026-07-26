"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { useApp } from "./AppProvider";

export function AppShell({ tabs, active, onTab, children }: { tabs: string[]; active: string; onTab: (tab: string) => void; children: ReactNode }) {
  const { currentAccount, logout, resetDemo } = useApp();
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Logo compact />
        <div className="account-chip">
          <span className="avatar">{currentAccount?.displayName?.slice(0, 1).toUpperCase() || "M"}</span>
          <div><strong>{currentAccount?.displayName}</strong><small>{currentAccount?.role === "student" ? "Student demo" : "Organization demo"}</small></div>
        </div>
        <nav className="app-tabs">
          {tabs.map((tab) => (
            <button key={tab} className={active === tab ? "active" : ""} onClick={() => onTab(tab)}>{tab}</button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/ethics">AI Ethics & Safety</Link>
          <Link href="/demo-guide">Judge demo guide</Link>
          <button onClick={resetDemo}>Reset demo</button>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
