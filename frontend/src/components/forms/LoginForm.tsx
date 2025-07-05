"use client"
import Link from "next/link"
import { useLoadingStore } from "@/store/loadingStore";
import { useErrorStore } from "@/store/errorState";
import React, { useState, } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import useNotifications from "@/hooks/useNotifications";
import DiscordAuth from "../auth/DiscordAuth";
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, setLoading, clearLoading } = useLoadingStore();
  const { setError, clearError } = useErrorStore();
  const { success, error: notifyError } = useNotifications();
  
  const router = useRouter(); const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation before sending
    if (!email || !email.trim()) {
      notifyError("Email is required");
      return;
    }

    if (!password || !password.trim()) {
      notifyError("Password is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notifyError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        const loginFailMessage = result.status === 401 ? "Email or password is incorrected" : "Some thing went wrong ";
        notifyError(loginFailMessage);
      } else {
        clearError();
        clearLoading();
        success("Login successfully")
        router.push("/profile");
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again later." + error;
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-120">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-700">Welcome back!</h1>
        <p className="text-gray-700">We're so excited to see you again!</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold uppercase mb-1 text-xs"
          htmlFor="email">
          Email  <span className="text-[#BC4749] ">*</span>
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          className="w-full p-2 bg-white text-gray-700 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-bold uppercase mb-1 text-xs"
          htmlFor="password" >
          Password <span className="text-[#BC4749]">*</span>
        </label>
        <input
          placeholder="Enter your password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full p-2 bg-white text-gray-700 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
        />
      </div>
      <Link href={"/auth/forgot-password"} className="text-[#A7C957] mb-4 hover:underline text-sm ">
        Forgot your password?
      </Link>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-[#386641] text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out hover:bg-[#6A994E] hover:scale-105 hover:shadow-lg hover:text-[#ffffff] transform active:scale-95
          ${isLoading ? 'bg-gray-400 cursor-not-allowed' : ' '}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : ("Log In")}
      </button>
      <div className="mt-4 text-center">
        <span className="text-gray-600 text-sm">Need an account?</span>
        <Link href="/auth/register" className="text-[#A7C957] font-semibold ml-2 hover:underline">
          Register
        </Link>
        <DiscordAuth />
      </div>
    </form>

  )
}