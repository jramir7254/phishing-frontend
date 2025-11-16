import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { tokenStore } from "../auth/use-team";


export interface Leaderboard {
    teamId: string,
    teamName: string,
    joinedAt: string
    finishedAt: string
    correctCount: number
}


export function useLeaderboard() {
    const [data, setData] = useState<Leaderboard[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                const res = await backend.get<Leaderboard[]>({ root: 'game', route: '/leaderboard' })
                setData(res.sort((t1, t2) => t2.correctCount - t1.correctCount))
            }
            catch (error: any) {
                logger.error('Error in useLeaderboard', error)

                if (error?.status === 401 || error?.status === 404) {
                    tokenStore.clear()
                    navigate('/')
                }
            }
            finally { setLoading(false) }
        })()
    }, [])



    return { data, loading }
}