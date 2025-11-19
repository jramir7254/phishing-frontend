import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { tokenStore } from "../auth/use-team";


interface ResultsData {
    attemptId: number,
    emailId: number,
    teamId: number,
    isCorrect: boolean,
    selectedOption: 'phishing' | 'legit'
}


export function useResults() {
    const [data, setData] = useState<ResultsData[] | null>(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                const res = await backend.get<ResultsData[]>({ root: 'game', route: '/results' })
                setData(res)
            }
            catch (error: any) {
                logger.error('Error in useResults', error)

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