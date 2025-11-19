import { useLeaderboard, type Leaderboard } from './use-leaderboard'
import { formatDate } from '@/lib/utils'
import { Heading } from '@/components/ui/typography'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Leaderboard() {

    const { data, loading } = useLeaderboard()

    if (loading) return <p>loading</p>


    return (
        <div className='flex-1'>

            <Heading>Leaderboard</Heading>
            <ScrollArea className='flex-1 h-full max-h-full'>
                <div className='space-y-3'>
                    {data && data.map((t, i) => (
                        <TeamCard key={`${t.teamName}-${t.teamId}`} index={i + 1} team={t} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}



const TeamCard = ({ index, team }: { index: number, team: Leaderboard }) => {

    const { teamId, teamName, correctCount, joinedAt, finishedAt } = team


    return (
        <div className='flex items-center bg-accent rounded-lg border-2 overflow-hidden font-nunit'>
            <div className='bg-black p-3'>
                <p>{index}</p>
            </div>
            <div className='p-3 inline-flex justify-between w-full'>
                <p className='font-bold'>{teamName}</p>
                <div>
                    {finishedAt && <p>{correctCount}/40</p>}
                </div>
            </div>
        </div>
    )
}
