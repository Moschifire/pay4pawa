import { z } from "zod";

// Regex for Nigerian numbers: 080..., 070..., 090..., 091..., 23480..., +23480...
export const nigerianPhoneRegex = /^(\+234|234|0)(701|702|703|704|705|706|707|708|709|802|803|804|805|806|807|808|809|810|811|812|813|814|815|816|817|818|819|909|908|901|902|903|904|905|906|907)([0-9]{7})$/;

export const normalizePhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    if (cleaned.startsWith('0')) {
        return '+234' + cleaned.substring(1);
    }
    if (cleaned.startsWith('234')) {
        return '+' + cleaned;
    }
    return '+' + cleaned;
};

// Zod schema for our auth form
export const authSchema = z.object({
    phone: z.string().regex(nigerianPhoneRegex, "Enter a valid Nigerian phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});