import React, { useState } from 'react'
import { useTeam } from '../auth/use-team'
import Email from './email'
import { Textarea } from '@/components/ui/textarea'
import { Button, Separator } from '@/components/ui'
import { backend } from '@/lib/api'
import { logger } from '@/lib/logger'
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs'
import { useEmail } from '@/hooks/use-email'
import { tokenStore } from "../auth/use-team";
import { useNavigate } from "react-router";

interface EmailSchema {
    id: string,
    subject: string,
    from: string,
    to: string,
    date: string,
    html: string
}

interface AttemptData {
    done: boolean,
    count: number,
    attempt: {
        id: string,
        teamId: string,
        email1: EmailSchema
        email2: EmailSchema
    };
}



export default function GamePage() {
    const team = useTeam()
    const [selection, setSelection] = useState<string | null>(null)
    const [reasoning, setReasoning] = useState("")
    const { data, loading, refetch } = useEmail()
    const navigate = useNavigate()

    if (loading) return <p>Loading…</p>;
    if (!data) return <p>Error: {String('error')}</p>;

    logger.debug('data', data)



    const email1 = data.attempt.email1
    const email2 = data.attempt.email2

    const canSubmit = selection && reasoning


    const onSubmit = async () => {
        try {
            logger.debug('data on sumbmit', { selection, reasoning })
            const res = await backend.post({ root: 'game', route: `/attempt/${data.attempt.id}/submit`, payload: { reasoning, selection } })
            logger.debug('data on sumbmit', res)
            setReasoning('')
            setSelection(null)
            refetch()
        } catch (error: any) {
            logger.error('Error in useResults', error)

            if (error?.status === 401 || error?.status === 404) {
                tokenStore.clear()
                navigate('/')
            }
        }
    }

    return (
        <div className='flex flex-1'>



            <Tabs className='w-[65%] max-w-[65%] gap-5 p-10' defaultValue='email1'>
                <TabsList className='bg-accent rounded-lg w-fit p-2'>
                    <TabsTrigger value='email1'>Email 1</TabsTrigger>
                    <TabsTrigger value='email2'>Email 2</TabsTrigger>
                </TabsList>

                <TabsContent value='email1' className='border-3 max-h-[75vh] rounded-lg border-dashed grid place-items-center overflow-auto p-5' >
                    <div onClick={() => setSelection(email1.id)} className='relative cursor-pointer' >
                        <div className={`rounded-xl absolute size-full ${selection === email1.id ? "shadow-[0px_0px_100px_25px_rgba(133,147,188,0.7)] animate-pulse" : ''}`} />
                        <Email email={email1} />
                    </div>
                </TabsContent>

                <TabsContent value='email2' className='border-3 max-h-[75vh] rounded-lg border-dashed grid place-items-center overflow-auto p-5' >
                    <div onClick={() => setSelection(email2.id)} className='relative cursor-pointer' >
                        <div className={`rounded-xl absolute size-full ${selection === email2.id ? "shadow-[0px_0px_100px_25px_rgba(133,147,188,0.7)] animate-pulse" : ''}`} />
                        <Email email={email2} />
                    </div>
                </TabsContent>
            </Tabs>

            <Separator orientation='vertical' />


            <div className='flex flex-col w-[35%]  pb-10 pt-25'>
                <div className='flex-1 flex justify-between px-10 font-nunit'>
                    <div>
                        <p><strong>Team Name:</strong> {team?.teamName}</p>
                        <p><strong>Join Code:</strong> {team?.joinCode}</p>
                    </div>
                    <p><strong>Progress:</strong> {data?.count} / 20</p>
                </div>
                <div className='flex-1 flex flex-col px-10 space-y-5'>
                    <h3 className='font-nunit font-bold text-lg'>Select which email you think is the phishing one and explain your reasoning <i className='font-normal'>{'(250 Characters Max)'}</i></h3>
                    <Textarea className='resize-none flex-1' value={reasoning} onChange={(e) => setReasoning(e.target.value)} maxLength={250} />
                    <Button disabled={!canSubmit} onClick={onSubmit} className='w-full'>Submit</Button>
                </div>
            </div>
        </div>
    )
}
