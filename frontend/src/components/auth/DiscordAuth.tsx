"use client";

import React from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * DiscordAuth (UI Pass)
 * - DesignUI Convention: rounded-2xl, soft borders, brand greens accents
 * - Animations: Tailwind-only (transition, focus ring, subtle hover scale)
 * - Two variants:
 *    1) inline (default): divider + button, no extra card (use inside forms)
 *    2) standalone: self-contained card for separate page usage
 */

interface DiscordAuthProps {
  variant?: "inline" | "standalone";
  redirectUrl?: string; // where to redirect after success
}

export default function DiscordAuth({ variant = "inline", redirectUrl = "/" }: DiscordAuthProps) {
  const router = useRouter();
  const { status } = useSession();
  const isLoading = status === "loading";
  const isAuthed = status === "authenticated";

  React.useEffect(() => {
    if (isAuthed) router.push(redirectUrl);
  }, [isAuthed, redirectUrl, router]);

  const handleSignIn = async () => {
    // Let next-auth handle redirect to provider; avoids manual router push
    await signIn("discord", { callbackUrl: redirectUrl });
  };

  // Simple spinner
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
        "bg-[#5865F2] text-white transition-all duration-200",
        "hover:brightness-110 hover:shadow-md hover:scale-[1.01] active:scale-[.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#6A994E]/40",
        isLoading ? "opacity-70 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {isLoading ? <Spinner /> : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.37a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037 7.41 7.41 0 00-.608 1.25 18.48 18.48 0 00-5.487 0 7.67 7.67 0 00-.618-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056 16.198 16.198 0 005.994 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106c-.653-.248-1.274-.55-1.872-.892a.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.078-.011c3.928 1.794 8.18 1.794 12.061 0a.074.074 0 01.078.01c.12.099.246.198.373.292a.077.077 0 01-.007.127c-.576.336-1.197.638-1.873.891a.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.029 16.198 16.198 0 005.994-3.03.077.077 0 00.031-.055c.5-5.177-.838-9.674-3.548-13.66a.061.061 0 00-.031-.029zM8.02 15.331c-1.182 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419-.019 1.333-.955 2.419-2.157 2.419zm7.975 0c-1.182 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.419-.019 1.333-.946 2.419-2.157 2.419z" />
        </svg>
      )}
      <span>Sign in with Discord</span>
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

  // Inline variant: divider + button, no extra card to avoid double wrapping inside forms
  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-wider text-gray-500">Or</span>
        <div className="h-[1px] flex-1 bg-gray-200" />
      </div>
      {Button}
    </div>
  );
}
