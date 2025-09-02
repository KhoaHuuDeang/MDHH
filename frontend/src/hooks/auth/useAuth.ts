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
                console.log("result tu frontend gui xuong", result)
                if (result?.error) throw new Error(result.error);
                success("Login successful");
                router.push("/profile");
            } else {
                const rawPayload = data as RegisterFormData
                // eliminate confirmpassword
                const { confirmPassword, ...result } = rawPayload
                //tạo formData mới bao gồm result
                const formData = { ...result }
                await authService.register(formData)
                success("Account created! Please sign in.");
                setMode('login');
            }
        } catch (err: unknown) {
            // Extract meaningful error message from backend response
            const errorMessage = (err as {response?: {data?: {message?: string}}, message?: string})?.response?.data?.message || (err as {message?: string})?.message || 'Đã có lỗi xảy ra';
            error(errorMessage);
        } finally {
            setLoading(false);
        }

    }
    return { handleAuth };
}