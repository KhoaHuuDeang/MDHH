import DiscordAuth from "@/components/auth/DiscordAuth";

export default function DiscordCallbackPage() {
  return (
    <div className="min-h-screen w-full bg-[#F0F7F4] flex items-center justify-center p-4">
      <div className="absolute top-4 left-5 z-10">
        <img
          src="/logo.svg"
          alt="Logo"
          width={100}
          height={50}
          className="cursor-pointer"
        />
      </div>
      <DiscordAuth />
    </div>
  );
}


