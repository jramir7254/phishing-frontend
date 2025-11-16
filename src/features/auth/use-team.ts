import { logger } from "@/lib/logger";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export type DecodedToken = {
    id: string,
    teamName: string;
    joinCode: string;
    isAdmin: boolean;
    joinedAt: string
    finishedAt: string
    correctCount: number
};



const _KEY = "access_token";

interface TokenState {
    token: string | null
    get(): string | null
    set: (t: string) => void
    clear: () => void
}

export const tokenStore = <TokenState>{
    token: sessionStorage.getItem(_KEY),
    get: () => sessionStorage.getItem(_KEY),
    set: (t) => {
        sessionStorage.setItem(_KEY, t)

    },
    clear: () => {
        sessionStorage.removeItem(_KEY)
        localStorage.clear()
    },
}

export function decodeToken(token: string | null): DecodedToken | null {
    if (!token) return null;
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (e) {
        logger.error('Invalid token', e);
        return null;
    }
}


export function useTeam() {
    const navigate = useNavigate()
    const token = tokenStore.get() // reactive now!

    useEffect(() => {
        if (!token) navigate('/')

        const team = decodeToken(token)

        if (team?.isAdmin) navigate('/admin')
    }, [token])



    return decodeToken(token)
}
