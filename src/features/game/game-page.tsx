import Email from './email'
import { Button, Separator } from '@/components/ui'
import { logger } from '@/lib/logger'
import { useEmail } from '@/hooks/use-email'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import Countdown from '@/components/blocks/timer'
import { minutesToMs } from '@/lib/utils'
import { useTeam } from '../auth/use-team'

export default function GamePage() {
    const { data: team, loading: teamLoading } = useTeam()
    const { data, loading, submit } = useEmail()

    if (loading || teamLoading) return <p>Loading…</p>;
    if (!data) return <p>Error: {String('error')}</p>;

    logger.debug('data', data)

    const { email } = data

    return (
        <div className='flex flex-1 px-5'>

            <div className='w-[75%] max-w-[75%] gap-5 p-10 flex items-center justify-center relative' >
                <div id="timer" className='absolute top-10 right-10'>
                    <div >
                        <Countdown startTime={team?.startedAt} timeLimit={minutesToMs(15)} />
                    </div>
                </div>
                <div>
                    <Button onClick={() => submit('legit')} variant={'outline'} size={'icon'}><ArrowLeftIcon /></Button>
                    <p>Legit</p>
                </div>
                <div className=' w-fit border-3 max-h-[75vh] rounded-lg border-dashed grid place-items-center overflow-auto p-5' >
                    <Email email={email} />
                </div>
                <div>
                    <Button onClick={() => submit('phishing')} variant={'outline'} size={'icon'}><ArrowRightIcon /></Button>
                    <p>Phish</p>
                </div>

            </div>

            <Separator orientation='vertical' />

            <div className='flex flex-col w-[25%]  pb-10 pt-25'>
                <div className='flex-1 flex justify-between px-10 font-nunit'>
                    <div>
                        <p><strong>Team Name:</strong> {team?.teamName}</p>
                        <p><strong>Join Code:</strong> {team?.joinCode}</p>
                    </div>
                    <p><strong>Progress:</strong> {data?.count} / 40</p>
                </div>
            </div>
        </div>
    )
}
