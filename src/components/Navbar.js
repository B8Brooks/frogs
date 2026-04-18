"use client";

import { signOut } from "next-auth/react";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-title">
          <span className="navbar-emoji">🐸</span>
          <span>Eat the Frog</span>
        </div>
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
