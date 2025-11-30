import { z } from 'zod';
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirm_password: z.ZodString;
    full_name: z.ZodString;
    company_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    company_name?: string | undefined;
}, {
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    company_name?: string | undefined;
}>, {
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    company_name?: string | undefined;
}, {
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    company_name?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    new_password: z.ZodString;
    confirm_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirm_password: string;
    token: string;
    new_password: string;
}, {
    confirm_password: string;
    token: string;
    new_password: string;
}>, {
    confirm_password: string;
    token: string;
    new_password: string;
}, {
    confirm_password: string;
    token: string;
    new_password: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    current_password: z.ZodString;
    new_password: z.ZodString;
    confirm_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirm_password: string;
    new_password: string;
    current_password: string;
}, {
    confirm_password: string;
    new_password: string;
    current_password: string;
}>, {
    confirm_password: string;
    new_password: string;
    current_password: string;
}, {
    confirm_password: string;
    new_password: string;
    current_password: string;
}>;
export declare const createPropertySchema: z.ZodObject<{
    name: z.ZodString;
    address_line1: z.ZodString;
    address_line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    postcode: z.ZodEffects<z.ZodString, string, string>;
    property_type: z.ZodEnum<["HOUSE", "FLAT", "COTTAGE", "COMMERCIAL"]>;
    bedrooms: z.ZodNumber;
    bathrooms: z.ZodNumber;
    access_instructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address_line1: string;
    city: string;
    postcode: string;
    property_type: "HOUSE" | "FLAT" | "COTTAGE" | "COMMERCIAL";
    bedrooms: number;
    bathrooms: number;
    address_line2?: string | undefined;
    access_instructions?: string | undefined;
}, {
    name: string;
    address_line1: string;
    city: string;
    postcode: string;
    property_type: "HOUSE" | "FLAT" | "COTTAGE" | "COMMERCIAL";
    bedrooms: number;
    bathrooms: number;
    address_line2?: string | undefined;
    access_instructions?: string | undefined;
}>;
export declare const updatePropertySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address_line1: z.ZodOptional<z.ZodString>;
    address_line2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    postcode: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    property_type: z.ZodOptional<z.ZodEnum<["HOUSE", "FLAT", "COTTAGE", "COMMERCIAL"]>>;
    bedrooms: z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodOptional<z.ZodNumber>;
    access_instructions: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    address_line1?: string | undefined;
    address_line2?: string | undefined;
    city?: string | undefined;
    postcode?: string | undefined;
    property_type?: "HOUSE" | "FLAT" | "COTTAGE" | "COMMERCIAL" | undefined;
    bedrooms?: number | undefined;
    bathrooms?: number | undefined;
    access_instructions?: string | undefined;
}, {
    name?: string | undefined;
    address_line1?: string | undefined;
    address_line2?: string | undefined;
    city?: string | undefined;
    postcode?: string | undefined;
    property_type?: "HOUSE" | "FLAT" | "COTTAGE" | "COMMERCIAL" | undefined;
    bedrooms?: number | undefined;
    bathrooms?: number | undefined;
    access_instructions?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
//# sourceMappingURL=index.d.ts.map