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
    attemptId: number,
    email: EmailSchema | null,
}

const placeHolder = {
    done: false,
    count: 0,
    attemptId: -1,
    email: null
}


export function useEmail() {
    const [data, setData] = useState<AttemptData>(placeHolder)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {

                if (data.attemptId !== -1) return

                const res = await backend.get<AttemptData>({ root: 'game', route: '/attempt' })

                if (res.done) {
                    logger.info(`[res.done]: ${res.done}`)
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



    const { attemptId } = data


    const submit = async (selection: 'legit' | 'phishing') => {
        try {
            logger.debug('data on sumbmit', { selection })
            const res = await backend.post<AttemptData>({ root: 'game', route: `/attempt/${attemptId}/submit`, payload: { selection } })
            logger.debug('data on sumbmit', res)

            if (res.done) {
                logger.info(`[res.done]: ${res.done}`)
                return navigate('/results')
            }
            setData(res)
            // refetch()
        } catch (error: any) {
            logger.error('Error in useResults', error)

            if (error?.status === 401 || error?.status === 404) {
                tokenStore.clear()
                navigate('/')
            }
        }
    }



    return { data, loading, setData, submit }
}