"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Header() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="header">
      <Link href="/select-trip">
        <img src="/togo_logo.png" alt="ToGo" className="h-25 -my-9" />
      </Link>

      {!loading && (
        <div className="flex gap-3">
          {user ? (
            <button onClick={logout} className="header-btn">
              Log Out
            </button>
          ) : (
            <>
              <button onClick={signInWithGoogle} className="header-btn">
                Log In
              </button>
              <button onClick={signInWithGoogle} className="header-btn header-btn-dark">
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
