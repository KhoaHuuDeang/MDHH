"use client";

import React, { useState } from "react";
import { useLoadingStore } from "@/store/loadingStore";
import { useAuth } from "@/hooks/auth/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import Image from "next/image";

// ------------------------------------
// Page Level
// ------------------------------------
export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { isLoading, setLoading } = useLoadingStore();
  const { handleAuth } = useAuth(mode, setMode);

  const isLogin = mode === "login";

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      {/* Background image - moved outside main and fixed positioning */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg_auth.jpg"         
          alt=""
          fill                      
          sizes="100vw"               
          quality={90}               
          priority                    
          className="object-cover"
          aria-hidden="true"
        />
        {/* Overlay cho dễ đọc */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <main className="w-full max-w-md">
        {/* Card */}
        <div className="relative rounded-2xl border border-gray-200 bg-white/90 backdrop-blur shadow-lg p-6 md:p-8 transition-all duration-300">
          {/* Header */}
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isLogin ? "Welcome back!" : "Create an account"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isLogin ? "We're so excited to see you again!" : "Join our community today!"}
            </p>
          </header>

          {/* Segmented Toggle */}
          <div className="mb-6">
            <div className="inline-flex w-full rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <div className="relative grid w-full grid-cols-2">
                <span
                  className={[
                    "absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg border",
                    "border-[#6A994E]/30 bg-[#E8F5E9]",
                    "transition-transform duration-300 ease-[cubic-bezier(.25,.8,.25,1)]",
                    isLogin ? "translate-x-0" : "translate-x-full",
                  ].join(" ")}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  aria-pressed={isLogin}
                  className={[
                    "relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isLogin ? "text-[#386641]" : "text-gray-600 hover:text-[#386641]",
                  ].join(" ")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  aria-pressed={!isLogin}
                  className={[
                    "relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    !isLogin ? "text-[#386641]" : "text-gray-600 hover:text-[#386641]",
                  ].join(" ")}
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          {/* Forms */}
          <section>
            {isLogin ? (
              <LoginForm onSubmit={handleAuth} isLoading={isLoading} onSwitchMode={() => setMode("register")} />
            ) : (
              <RegisterForm onSubmit={handleAuth} isLoading={isLoading} onSwitchMode={() => setMode("login")} />
            )}
          </section>
        </div>

        {/* Footer helper */}
        <p className="mt-4 text-center text-xs text-white/80">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </main>
    </div>
  );
}