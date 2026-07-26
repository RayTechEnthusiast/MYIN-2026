"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { useApp } from "./AppProvider";

export function SiteHeader() {
  const { session, currentAccount, logout } = useApp();
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Logo />
        <nav className="public-nav" aria-label="Primary navigation">
          <Link href="/#mission">Mission</Link>
          <Link href="/ethics">AI Ethics & Safety</Link>
          <Link href="/future">Future</Link>
          <Link href="/demo-guide">Demo Guide</Link>
        </nav>
        <div className="nav-actions">
          {session ? (
            <>
              <Link className="button ghost small" href="/app">{currentAccount?.displayName || "Dashboard"}</Link>
              <button className="button small" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="button ghost small" href="/auth?mode=login">Log in</Link>
              <Link className="button small" href="/auth?mode=signup">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
