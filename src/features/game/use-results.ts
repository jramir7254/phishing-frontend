import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { tokenStore } from "../auth/use-team";

interface EmailSchema {
    id: string,
    subject: string,
    from: string,
    to: string,
    date: string,
    html: string
}

interface AttemptData {
    done: boolean,
    count: number,
    attempt: {
        id: string,
        teamId: string,
        email1: EmailSchema
        email2: EmailSchema
    };
}


export function useResults() {
    const [data, setData] = useState<AttemptData[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [version, setVersion] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                const res = await backend.get<AttemptData[]>({ root: 'game', route: '/results' })

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


    const refetch = () => setVersion(prev => prev + 1);



    return { data, loading, refetch }
}