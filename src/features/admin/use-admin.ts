import { backend } from "@/lib/api";
import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import type { DecodedToken } from "../auth/use-team";




export function useTeams() {
    const [data, setData] = useState<DecodedToken[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [version, setVersion] = useState(0)

    useEffect(() => {
        (async () => {
            try {
                const res = await backend.get<DecodedToken[]>({ root: 'admin', route: '/teams' })
                setData(res)
            }
            catch (error) { logger.error('Error in useEmail', error) }
            finally { setLoading(false) }
        })()
    }, [version])


    const refetch = () => setVersion(prev => prev + 1);

    return { data, loading, refetch }
}

