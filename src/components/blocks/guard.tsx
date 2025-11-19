import React from 'react'


import { useAuth } from '@/providers/auth-provider'
import { logger } from '@/lib/logger'


export default function Guard({ children }: { children: React.ReactNode }) {
    const { team, loading } = useAuth()


    if (!team || loading) return null
    else return children
}
