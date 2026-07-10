"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-title">
          <span className="navbar-emoji">🐸</span>
          <span>Eat the Frog</span>
        </div>
        <nav className="navbar-links">
          <Link href="/" className={`navbar-link ${pathname === "/" ? "active" : ""}`}>
            🐸 Frogs
          </Link>
          <Link
            href="/music"
            className={`navbar-link ${pathname === "/music" ? "active" : ""}`}
          >
            🎵 Music
          </Link>
        </nav>
        <button
          className="btn btn-ghost"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
