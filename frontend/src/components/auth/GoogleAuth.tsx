"use client";

import React from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * GoogleAuth
 * - Similar to DiscordAuth
 * - Two variants: inline (default) and standalone
 */

interface GoogleAuthProps {
  variant?: "inline" | "standalone";
  redirectUrl?: string;
}

export default function GoogleAuth({ variant = "inline", redirectUrl = "/" }: GoogleAuthProps) {
  const router = useRouter();
  const { status } = useSession();
  const isLoading = status === "loading";
  const isAuthed = status === "authenticated";

  React.useEffect(() => {
    if (isAuthed) router.push(redirectUrl);
  }, [isAuthed, redirectUrl, router]);

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: redirectUrl });
  };

  const Spinner = () => (
    <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
    </svg>
  );

  const Button = (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      aria-busy={isLoading}
      className={[
        "w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold",
        "bg-white text-gray-700 border border-gray-300 transition-all duration-200",
        "hover:bg-gray-50 hover:shadow-md hover:scale-[1.01] active:scale-[.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#6A994E]/40",
        isLoading ? "opacity-70 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {isLoading ? <Spinner /> : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      <span>Sign in with Google</span>
    </button>
  );

  if (variant === "standalone") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-gray-200" />
            <span className="text-xs uppercase tracking-wider text-gray-500">Or</span>
            <div className="h-[1px] flex-1 bg-gray-200" />
          </div>
        </div>
        {Button}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {Button}
    </div>
  );
}
