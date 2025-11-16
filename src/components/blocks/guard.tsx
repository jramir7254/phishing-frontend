import React from 'react'

import { useTeam } from '@/features/auth/use-team'

export default function Guard({ children }: { children: React.ReactNode }) {
    const team = useTeam()

    if (!team) return null
    return children
}
