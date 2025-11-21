import { Button, Separator } from '@/components/ui'
import { backend, type ApiError, type BaseBackendResponse } from '@/lib/api'
import { toast } from 'sonner'
import { useTeams } from './use-admin'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DecodedToken } from '../auth/use-team'
import { Heading } from '@/components/ui/typography'
import { formatDate } from '@/lib/utils'
import { Trash } from 'lucide-react'


export interface Team extends DecodedToken {
    joinedAt: string
    finishedAt: string
    correctCount: number
}

export default function AdminPage() {

    const { data, refetch } = useTeams()


    const resetDemo = async () => {
        try {
            const { message } = await backend.post<BaseBackendResponse>({
                root: 'admin',
                route: '/reset',
            })
            toast.success(message)
        } catch (error: unknown) {
            toast.error((error as ApiError)?.message)
        }
    }
    return (
        <div className='flex flex-1 m-10 gap-5'>
            <div className='flex-1'>

                <Heading>Teams</Heading>
                <ScrollArea className='flex-1 h-full max-h-full'>
                    <div className='space-y-3'>
                        {data && data.map(t => (
                            <TeamCard key={`${t.teamName}-${t.id}`} team={t} refetch={refetch} />
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <Separator orientation='vertical' />
            <div className='flex-1'>
                <Button disabled onClick={resetDemo} variant='destructive'>Reset</Button>
            </div>
        </div>
    )
}


const TeamCard = ({ team, refetch }: { team: Team, refetch: () => void }) => {

    const { id, teamName, joinCode, joinedAt, finishedAt } = team


    const deleteTeam = async () => {
        await backend.delete({ root: 'admin', route: `/teams/${team.id}` })
        refetch()
    }

    return (
        <div className='flex items-center bg-accent rounded-lg border-2 overflow-hidden font-nunit'>
            <div className='bg-black p-3'>
                <p>{id}</p>
            </div>
            <div className='p-3 inline-flex justify-between w-full'>

                <p>{teamName}</p>
                <p>{joinCode}</p>

                <div className='inline-flex'>
                    <p>Joined At: <span className='text-muted-foreground'>{formatDate(joinedAt)}</span></p>
                    <p>Finished At:   <span className='text-muted-foreground'>{finishedAt ? formatDate(finishedAt) : 'In progress'}</span></p>
                </div>

                <div>
                    {finishedAt && <p>{team.correctCount}</p>}
                </div>
            </div>

            <div>
                <Button onClick={deleteTeam} variant={'outline'} size={'icon'}><Trash /></Button>
            </div>
        </div >
    )
}
