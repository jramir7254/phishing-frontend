import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
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
export type TeamSchema = {
    id: string,
    teamName: string;
    joinCode: string;
    isAdmin: boolean;
    joinedAt: string
    startedAt: string,
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
    const [data, setData] = useState<TeamSchema | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async () => {
            try {

                const res = await backend.get<TeamSchema>({ root: 'auth', route: '/teams/self' })

                if (!res) navigate('/')

                if (res.isAdmin) navigate('/admin')

                if (res.finishedAt) {
                    logger.info(`[res.done]: ${res.finishedAt}`)
                    navigate('/results')
                    return
                }

                setData(res)

            }
            catch (error: any) {
                logger.error('Error in useResults', error)

                if (error?.status === 401 || error?.status === 404) {
                    tokenStore.clear()
                    navigate('/', { replace: true })
                }
            }
            finally { setLoading(false) }
        })()
    }, [])

    useEffect(() => {
        logger.debug('data', data)
    }, [data])


    return { data, loading }
}


export function useLogout() {
    const navigate = useNavigate()

    return () => {
        tokenStore.clear()
        navigate('/')
    }
}