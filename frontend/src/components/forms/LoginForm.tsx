"use client"
import Link from "next/link"
import { useLoadingStore } from "@/store/loadingStore";
import { useErrorStore } from "@/store/errorState";
import React, { useState, } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, setLoading, clearLoading } = useLoadingStore();
  const { error, setError, clearError } = useErrorStore();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        clearError();
        clearLoading();
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="bg-[#6A994E] p-8 rounded-lg shadow-lg w-120">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#FFFFFF]">Welcome back!</h1>
        <p className="text-[#386641]">We're so excited to see you again!</p>
      </div>
      <div className="mb-4">
        <label className="block text-[#386641] font-bold uppercase mb-1 text-xs"
          htmlFor="email">
          Email  <span className="text-[#BC4749] ">*</span>
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          className="w-full p-2 bg-white text-[#386641] border border-[#6A994E] rounded focus:border-[#A7C957] focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-[#386641] font-bold uppercase mb-1 text-xs"
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
          className="w-full p-2 bg-white text-[#386641] border border-[#6A994E] rounded focus:border-[#A7C957] focus:outline-none"
        />
      </div>
      <Link href={"/auth/forgot-password"} className="text-[#386641] mb-4 hover:underline text-sm ">
        Forgot your password?
      </Link>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-gradient-to-t from-[#386641] to-[#A7C957] text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out hover:from-[#6A994E] hover:to-[#A7C957] hover:scale-105 hover:shadow-lg hover:text-[#386641] transform active:scale-95
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
        <span className="text-[#386641] text-sm">Need an account?</span>
        <Link href="/auth/register" className="text-[#386641] ml-2 hover:underline">
          Register
        </Link>
      </div>
    </form>

  )
}