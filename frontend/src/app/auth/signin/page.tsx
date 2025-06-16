import LoginForm from '@/components/forms/LoginForm'
import Image from 'next/image'

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full bg-[#F0F7F4] flex items-center justify-center p-4">
      <div className="absolute top-4 left-5 z-10">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={100}
          height={50}
          priority
          className="cursor-pointer"
        />
      </div>
      <LoginForm />
    </div>
  )
}
