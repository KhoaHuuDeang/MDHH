import { useLoadingStore } from "@/store/loadingStore";
import useNotifications from "../useNotifications";
import { useRouter } from "next/navigation";
import { authService } from "@/services/userService";
import { signIn } from "next-auth/react";
import { LoginFormData, RegisterFormData } from "@/lib/validations/auth";

export const useAuth = (mode: 'login' | 'register', setMode: (mode: 'login' | 'register') => void) => {
    const { setLoading } = useLoadingStore();
    const { success, error } = useNotifications();
    const router = useRouter();

    const handleAuth = async (data: LoginFormData | RegisterFormData) => {
        setLoading(true)
        try {
            if (mode === 'login') {
                const result = await signIn('credentials', data as LoginFormData);
                if (result?.error) throw new Error(result.error);
                success("Login successful");
                router.push("/profile");
            } else {
                const rawPayload = data as RegisterFormData
                //loại bỏ day-month-year ra khỏi data (rest)
                const { day, month, year, ...rest } = rawPayload
                const birth = `${day}/${month}/${year}`
                //loại bỏ confirmPassword ra khỏi data (result)
                const { confirmPassword: _confirmPassword, ...result } = rest
                //tạo formData mới bao gồm result và birth
                const formData = { ...result, birth }
                await authService.register(formData)
                success("Account created! Please sign in.");
                setMode('login');
            }
        } catch (err) {
            error(err.message);
        } finally {
            setLoading(false);
        }

    }
    return { handleAuth };
}