import { z } from "zod"

export const registerSchema = z.object({
    email: z.string().regex(/^[\w-\.]+@gmail\.com$/, 'Email must be @gmail.com'),
    displayname: z.string().min(1, "Display name is required").min(2, "Display name must be at least 2 characters"),
    username: z.string().min(1, "Username is required").min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, underscores and periods"),
    password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    day: z.string().min(1, "Day is required"),
    month: z.string().min(1, "Month is required"),
    year: z.string().min(1, "Year is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
.refine((data) => {
    // 1. Gộp lại để tạo đối tượng Date
    const dateString = `${data.year}-${data.month.padStart(2, '0')}-${data.day.padStart(2, '0')}`;
    const date = new Date(dateString);

    // 2. Kiểm tra tính hợp lệ
    // Kiểm tra xem các giá trị ngày, tháng, năm có khớp với đối tượng Date được tạo ra không.
    // Nếu bạn nhập 30/02, đối tượng Date sẽ tự chuyển thành 01/03, và kiểm tra này sẽ báo lỗi.
    if (date.getFullYear() !== Number(data.year) || date.getMonth() + 1 !== Number(data.month) || date.getDate() !== Number(data.day)) {
        return false;
    }
    
    return true;
}, {
    message: "Ngày sinh không hợp lệ",
    // Gán lỗi cho cả 3 trường để frontend highlight
    path: ["day", "month", "year"], 
})
// --------------------------------------------------------
// BƯỚC 3: Biến đổi (Transform) dữ liệu cuối cùng
.transform((data) => {
    // Tạo chuỗi ngày tháng theo định dạng bạn cần (DD/MM/YYYY)
    const birthDate = `${data.day}/${data.month}/${data.year}`;

    // Loại bỏ các trường day, month, year và thêm trường birth mới
    const { day: _day, month: _month, year: _year, ...rest } = data;
    
    return {
        ...rest,
        birth: birthDate, // Thêm trường birth với định dạng mong muốn
    };
});
export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
