import RegisterForm from "@/components/forms/RegisterForm";
import Image from 'next/image'

export default function RegisterPage() {
    return (
        <div className="min-h-screen w-full bg-[#F0F7F4] flex items-center justify-center p-4">
            {/* Logo container with white background and shadow */}
            <div className="absolute top-4 left-5 ">
                <Image 
                    src="/logo.svg" 
                    alt="Logo" 
                    width={100} 
                    height={50}
                />
            </div>
            <RegisterForm />
        </div>
    )
}