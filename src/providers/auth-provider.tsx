import { backend } from '@/lib/api';
import { logger } from '@/lib/logger';
import { tokenStore } from '@/lib/store';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate } from "react-router";

export type TeamSchema = {
    id: string;
    teamName: string;
    joinCode: string;
    isAdmin: boolean;
    joinedAt: string;
    startedAt: string;
    finishedAt: string;
    correctCount: number;
};

type AuthContextType = {
    team: TeamSchema | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;

};

export const AuthContext = createContext<AuthContextType>({
    team: null,
    loading: true,
    refresh: async () => { },
    logout: async () => { }
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [team, setTeam] = useState<TeamSchema | null>(null);
    const [loading, setLoading] = useState(true);

    function safeNavigate(path: string) {
        if (location.pathname !== path) navigate(path);
    }



    useEffect(() => {
        logger.info('AuthProvider useEffect')
        let cancelled = false;

        async function loadUser() {
            try {
                const res = await backend.get<TeamSchema>({
                    root: 'auth',
                    route: '/teams/self'
                });

                logger.warn('AuthProvider useEffect', { team: res })


                if (cancelled) return;

                if (!res) {
                    safeNavigate('/');
                    return;
                }

                setTeam(res);

                if (res.isAdmin) safeNavigate('/admin');
                else if (res.finishedAt) safeNavigate('/results');
                else if (res.startedAt) safeNavigate('/live');
                else safeNavigate('/instructions');

            } catch (error: any) {
                if (cancelled) return;

                logger.error('Error in AuthProvider:', error);

                if (error?.status === 401 || error?.status === 404) {
                    tokenStore.clear();
                    navigate('/', { replace: true });
                }

            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadUser();

        return () => { cancelled = true };
    }, [navigate]);

    async function refresh() {
        setLoading(true);
        try {
            const res = await backend.get<TeamSchema>({
                root: 'auth',
                route: '/teams/self'
            });

            setTeam(res);

            // reuse your navigation logic:
            if (res.isAdmin) navigate('/admin');
            else if (res.finishedAt) navigate('/results');
            else if (res.startedAt) navigate('/live');
            else navigate('/instructions');

        } catch (err: any) {
            tokenStore.clear();
            navigate('/');
        } finally {
            setLoading(false);
        }
    }



    async function logout() {
        setTeam(null)
        tokenStore.clear();
        navigate('/');
    }


    return (
        <AuthContext.Provider value={{ team, loading, refresh, logout }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }

    return context;
}