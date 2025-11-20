import React from 'react'
import { useResults } from './use-results'
import { formatDate } from '@/lib/utils'
import Leaderboard from './leaderboard'
import { Button, Separator } from '@/components/ui'
import { Heading } from '@/components/ui/typography'

import { useTeam } from '../auth/use-team'

export default function ResultsPage() {



    const { data, loading } = useResults()
    const { data: team } = useTeam()

    if (!team || !data || loading) return <p className='text-xl'>loading...</p>

    const count = data.reduce((c, a) => c + Number(a.isCorrect), 0);


    return (
        <div className='flex size-full'>
            <div className='w-[35%] p-10'>
                <Leaderboard />
            </div>
            <Separator orientation='vertical' />
            <div className='flex flex-col w-[65%] p-10 font-nunit gap-5'>
                <Heading className='text-4xl '>Results</Heading>
                <div className='space-y-2'>
                    <p className='text-xl'><strong>Team Name:</strong> {team?.teamName}</p>
                    <p className='text-xl'><strong>Join Code:</strong> {team?.joinCode}</p>
                    <p className='text-xl'><strong>Started At: </strong>{formatDate(team?.joinedAt)}</p>
                    <p className='text-xl'><strong>Finished At:</strong> {formatDate(team?.finishedAt)}</p>
                </div>
                <Separator />
                <div className='flex-1 grid place-items-center'>
                    <p className='text-5xl font-bold'>{count}/40</p>
                </div>
            </div>
        </div>
    )
}
