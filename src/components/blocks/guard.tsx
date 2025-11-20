import React from 'react'


import { useTeam } from '@/features/auth/use-team'
import { logger } from '@/lib/logger'


export default function Guard({ children }: { children: React.ReactNode }) {
    const { data: team, loading } = useTeam()


    if (!team || loading) return null
    else return children
}
