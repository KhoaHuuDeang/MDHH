'use client'
import Link from "next/link"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLoadingStore } from "@/store/loadingStore"
import { useErrorStore } from "@/store/errorState"
import { useRouter } from "next/navigation"
import useNotifications from "@/hooks/useNotifications"
export default function RegisterForm() {
    const { isLoading, setLoading, clearLoading } = useLoadingStore()
    const { error, setError, clearError } = useErrorStore()
    const { success } = useNotifications()
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        clearError();
        //loại bỏ day-month-year ra khỏi data (rest)
        const { day, month, year, ...rest } = data
        const birth = `${day}/${month}/${year}`
        //loại bỏ confirmPassword ra khỏi data (result)
        const { confirmPassword, ...result } = rest
        //tạo formData mới bao gồm result và birth
        const formData = {...result, birth}

        try { 
            const response = await fetch('http://localhost:3001/auth/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message)
                return;
            }
            clearError();
            success("Account created successfully! Please sign in.");
            router.push("/auth/signin");
        } catch (err) {
            setError("Network error. Please try again later.");
        } finally {
            clearLoading();
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-lg w-120 mt-20">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-gray-700">Create an account</h1>
                <p className="text-gray-700">Join our community today!</p>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-[#BC4749] rounded">
                        {error}
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold uppercase mb-1 text-xs" htmlFor="email">
                    EMAIL <span className="text-[#BC4749]">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    {...register('email')}
                    placeholder="Enter your email"
                    className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                />
                {errors.email && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.email.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold uppercase mb-1 text-xs" htmlFor="displayname">
                    DISPLAY NAME <span className="text-[#BC4749]">*</span>
                </label>
                <input
                    type="text"
                    id="displayname"
                    {...register('displayname')}
                    placeholder="Enter your displayname"
                    className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                />
                {errors.displayname && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.displayname.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold uppercase mb-1 text-xs" htmlFor="username">
                    USERNAME <span className="text-[#BC4749]">*</span>
                </label>
                <input
                    type="text"
                    id="username"
                    {...register('username')}
                    placeholder="Enter your username"
                    className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                />
                {errors.username && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.username.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold uppercase mb-1 text-xs" htmlFor="password">
                    PASSWORD <span className="text-[#BC4749]">*</span>
                </label>
                <input
                    type="password"
                    id="password"
                    {...register("password")}
                    placeholder="Enter your password"
                    className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                />
                {errors.password && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.password.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold uppercase mb-1 text-xs" htmlFor="confirmPassword">
                    CONFIRM PASSWORD <span className="text-[#BC4749]">*</span>
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    placeholder="Confirm your password"
                    className="w-full p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                />
                {errors.confirmPassword && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.confirmPassword.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold uppercase mb-1 text-xs">
                    DATE OF BIRTH <span className="text-[#BC4749]">*</span>
                </label>
                <div className="flex space-x-2">
                    <select
                        id="day"
                        defaultValue={""}
                        {...register('day')}
                        className="w-1/3 p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                    >
                        <option value="" disabled>day</option>
                        {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                    <select
                        id="month"
                        {...register('month')}
                        defaultValue=""
                        className="w-1/3 p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                    >
                        <option value="" disabled>month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                    <select
                        id="year"
                        defaultValue={""}
                        {...register('year')}
                        className="w-1/3 p-2 text-gray-800 border border-gray-300 rounded focus:border-gray-700 focus:outline-none"
                    >
                        <option value="" disabled>year</option>
                        {Array.from({ length: 100 }, (_, i) => (
                            <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
                        ))}
                    </select>
                </div>
                {errors.month && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.month.message}</p>
                )}
                {errors.day && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.day.message}</p>
                )}
                {errors.year && (
                    <p className="text-[#BC4749] text-xs font-semibold mt-1">{errors.year.message}</p>
                )}
            </div>

            <button
                type="submit"
                className={`w-full bg-[#386641] text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out hover:bg-[#6A994E] hover:text-white hover:scale-105 hover:shadow-lg transform active:scale-95
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
                ) : ("Create Account")}
            </button>

            <div className="mt-4 text-center">
                <span className="text-gray-600 text-sm">Already have an account?</span>
                <Link href="/auth/signin" className="text-[#A7C957] ml-2 hover:underline font-semibold" onClick={() => { clearError() }}>
                    Sign In
                </Link>
            </div>
        </form>
    )
}