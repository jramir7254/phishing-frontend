import { useNavigate } from "react-router";
import { type AttemptData, useEmail } from "./use-email";
import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { tokenStore } from "@/features/auth/use-team";

export function useSubmission() {
    const { data, setData, loading } = useEmail()
    const navigate = useNavigate()


    const { attemptId } = data


    const submit = async (selection: 'legit' | 'phishing') => {
        try {
            logger.debug('data on sumbmit', { selection })
            const res = await backend.post<AttemptData>({ root: 'game', route: `/attempt/${attemptId}/submit`, payload: { selection } })
            logger.debug('data on sumbmit', res)
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

    return { submit }
}