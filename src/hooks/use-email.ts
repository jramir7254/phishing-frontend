import { tokenStore } from "@/features/auth/use-team";
import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";


interface EmailSchema {
    id: string,
    subject: string,
    from: string,
    to: string,
    date: string,
    html: string
}

export interface AttemptData {
    done: boolean,
    count: number,
    attempt: {
        id: string,
        teamId: string,
        email1: EmailSchema
        email2: EmailSchema
    };
}


export function useEmail() {
    const [data, setData] = useState<AttemptData | null>(null)
    const [loading, setLoading] = useState(true)
    const [version, setVersion] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                const res = await backend.get<AttemptData>({ root: 'game', route: '/attempt' })

                if (res.done) {
                    logger.info(`[res.done]: ${res.done}`)
                    navigate('/results')
                    return
                }

                // 👉 shuffle email1 and email2
                if (Math.random() < 0.5) {
                    const temp = res.attempt.email1;
                    res.attempt.email1 = res.attempt.email2;
                    res.attempt.email2 = temp;
                }

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
    }, [version])


    const refetch = () => setVersion(prev => prev + 1);



    return { data, loading, refetch }
}