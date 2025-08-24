interface RegisterSubmitData {
  email: string;
  displayname: string;
  username: string;
  password: string;
  confirmPassword: string;
  birth: string;
}
interface RegisterFormProps {
  onSubmit: (data: RegisterSubmitData) => void;
  isLoading: boolean;
  onSwitchMode?: () => void;
}

import { registerSchema } from "@/lib/validations/auth";
import { useState } from "react";
export default function RegisterForm({ onSubmit, isLoading, onSwitchMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    displayname: "",
    username: "",
    password: "",
    confirmPassword: "",
    day: "",
    month: "",
    year: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) fieldErrors[error.path[0] as string] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const birth = `${formData.day}/${formData.month}/${formData.year}`;
    onSubmit({
      email: formData.email,
      displayname: formData.displayname,
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      birth,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Email <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          placeholder="Enter your email (@gmail.com only)"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.email && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.email}</p>}
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="reg-displayname" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Display Name <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="reg-displayname"
          type="text"
          value={formData.displayname}
          onChange={handleInputChange("displayname")}
          placeholder="Enter your display name"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.displayname && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.displayname}</p>}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="reg-username" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Username <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="reg-username"
          type="text"
          value={formData.username}
          onChange={handleInputChange("username")}
          placeholder="Enter your username"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.username && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.username}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Password <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="reg-password"
          type="password"
          value={formData.password}
          onChange={handleInputChange("password")}
          placeholder="Enter your password"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.password && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="reg-confirm" className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Confirm Password <span className="text-[#BC4749]">*</span>
        </label>
        <input
          id="reg-confirm"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          placeholder="Confirm your password"
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-[#BC4749]">{errors.confirmPassword}</p>}
      </div>

      {/* DOB */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-gray-700">
          Date of Birth <span className="text-[#BC4749]">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <select
            id="day"
            value={formData.day}
            onChange={handleInputChange("day")}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select
            id="month"
            value={formData.month}
            onChange={handleInputChange("month")}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select
            id="year"
            value={formData.year}
            onChange={handleInputChange("year")}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#6A994E] focus:ring-2 focus:ring-[#6A994E]/40 transition-all"
          >
            <option value="">Year</option>
            {Array.from({ length: 100 }, (_, i) => (
              <option key={2025 - i} value={2025 - i}>
                {2025 - i}
              </option>
            ))}
          </select>
        </div>
        {(errors.day || errors.month || errors.year) && (
          <p className="mt-1 text-xs font-semibold text-[#BC4749]">
            {errors.day || errors.month || errors.year}
          </p>
        )}
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
          "Create Account"
        )}
      </button>

      <div className="pt-2 text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>
        <button type="button" onClick={onSwitchMode} className="ml-2 font-semibold text-[#6A994E] hover:underline">
          Sign In
        </button>
      </div>
    </form>
  );
}
