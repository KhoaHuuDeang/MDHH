interface LoginFormProps {
  onSubmit: (data: { type: "login"; email: string; password: string }) => void;
  isLoading: boolean;
  onSwitchMode?: () => void;
}

import { loginSchema } from "@/lib/validations/auth";
import Link from "next/link";
import { useState } from "react";
import DiscordAuth from "./DiscordAuth";
export default function LoginForm({ onSubmit, isLoading, onSwitchMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) fieldErrors[error.path[0] as string] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit({ type: "login", email: email.trim(), password: password.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Email <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.email && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Password <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.password && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <Link href="/auth/forgot-password" className="text-sm font-medium text-[#6A994E] hover:underline" tabIndex={-1}>
          Forgot your password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={[
          "w-full rounded-lg bg-[#386641] px-4 py-3 font-semibold text-white transition-all duration-300",
          "hover:bg-[#2d4f31] hover:shadow-lg hover:scale-[1.01] active:scale-[.99]",
          isLoading ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="mr-2 h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
            </svg>
            Loading...
          </span>
        ) : (
          "Log In"
        )}
      </button>

      <div className="pt-2 text-center text-sm">
        <span className="text-gray-600">Need an account?</span>
        <button type="button" onClick={onSwitchMode} className="ml-2 font-semibold text-[#6A994E] hover:underline">
          Register
        </button>
      </div>

      <div className="pt-2">
        <DiscordAuth />
      </div>
    </form>
  );
}
