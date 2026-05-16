import { setCookie, deleteCookie } from 'cookies-next';

export const setSession = (token: string) => {
    setCookie('auth-token', token, { maxAge: 60 * 60 * 24 * 7 }); // 1 week
};

export const clearSession = () => {
    deleteCookie('auth-token');
};