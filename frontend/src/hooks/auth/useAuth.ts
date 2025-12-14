import { useLoadingStore } from "@/store/loadingStore";
import useNotifications from "../useNotifications";
import { useRouter } from "next/navigation";
import { authService } from "@/services/userService";
import { signIn } from "next-auth/react";
import { LoginFormData, RegisterFormData } from "@/lib/validations/auth";
import { controllers } from "chart.js";
import { useTranslation } from "react-i18next";

export const useAuth = (
  mode: "login" | "register",
  setMode: (mode: "login" | "register") => void
) => {
  const { setLoading } = useLoadingStore();
  const { success, error } = useNotifications();
  const router = useRouter();
  const { t } = useTranslation();

  const handleAuth = async (data: LoginFormData | RegisterFormData) => {
    setLoading(true);
    try {
      if (mode === "login") {
        if (!data) return;
        const result = await signIn("credentials", {
          ...data,
          redirect: false,
        });

        if (!result?.ok) {
          throw new Error(result?.error || t('auth.loginError'));
        }

        success(t('auth.loginSuccess'));
        router.push("/home");
      } else {
        const rawPayload = data as RegisterFormData;
        // eliminate confirmpassword
        const { confirmPassword, ...result } = rawPayload;
        //tạo formData mới bao gồm result
        const formData = { ...result };
        await authService.register(formData);
        success(t('auth.registerSuccess'));
        setMode("login");
      }
    } catch (err: unknown) {
      // Extract meaningful error message from backend response
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "An error occurred";
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return { handleAuth };
};
