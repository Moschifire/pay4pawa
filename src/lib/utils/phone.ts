import { z } from "zod";

// Ensure 'export' is at the front of this line
export const nigerianPhoneRegex = /^(\+234|234|0)(701|702|703|704|705|706|707|708|709|802|803|804|805|806|807|808|809|810|811|812|813|814|815|816|817|818|819|909|908|901|902|903|904|905|906|907)([0-9]{7})$/;

export const normalizePhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '+234' + cleaned.substring(1);
    if (cleaned.startsWith('234')) return '+' + cleaned;
    return '+' + cleaned;
};

export const authSchema = z.object({
    name: z.string().min(2, "Name is required").optional(),
    // Make identifier optional so it doesn't block Sign Up
    identifier: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().regex(nigerianPhoneRegex, "Invalid phone").optional(),
    password: z.string().min(8, "Minimum 8 characters"),
});