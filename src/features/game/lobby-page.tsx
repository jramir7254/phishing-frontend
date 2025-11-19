import { Button } from '@/components/ui';
import { useEmail } from '@/hooks/use-email';
import { logger } from '@/lib/logger';
import { useAuth } from '@/providers/auth-provider';
import { Separator } from '@/components/ui';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import React from 'react'
import Email, { type EmailProps } from './email';
import { useTutorial, TutorialProvider } from '@/providers/tutorial-provider';
import Tutorial from './tutorial';

export const templateEmail: EmailProps = {
    id: "welcome-001",
    subject: "Welcome to PuzzleQuest!",
    from: "PuzzleQuest Team <no-reply@puzzlequest.com>",
    date: new Date().toLocaleString(),
    html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            
            <h2 style="margin-top: 0;">🎉 Welcome to PuzzleQuest!</h2>

            <p>
                We're excited to have you join the competition. Your team has been successfully registered,
                and you're officially ready to begin the challenge!
            </p>

            <p>
                Before the game begins, here are a few steps to help you prepare:
            </p>

            <ul>
                <li><strong>Review the instructions</strong> so you understand how scoring works.</li>
                <li><strong>Double-check your team name</strong> and make sure everyone has joined.</li>
                <li><strong>Keep an eye out</strong> for the game start notification.</li>
            </ul>

            <p>
                If you have any questions, feel free to reply to this email or contact support.
            </p>

            <p style="margin-top: 24px;">
                Best of luck,<br />
                <strong>The PuzzleQuest Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

            <p style="font-size: 0.85rem; color: #777;">
                This is an automated message. Please do not share your team code with anyone outside your group.
            </p>
        </div>
    `
};


export default function LobbyPage() {
    const { team, loading: teamLoading } = useAuth()
    // const { start } = useTutorial();

    // function launchTutorial() {
    //     start([
    //         { target: "#start-btn", content: "Click here to start the game." },
    //         { target: "#email", content: "This is your live score." },
    //         { target: "#finish-btn", content: "Press here to finish!" },
    //     ]);
    // }

    if (teamLoading || !team) return <p>Loading…</p>;

    // TODO: Replace this mock data with actual data fetching logic
    const email = templateEmail

    return (
        <div className='flex flex-1 px-5 '>
            <div className='w-[75%] max-w-[75%] gap-5 p-10 flex items-center justify-center relative' >
                <Tutorial />
                <Button id='start-btn' variant={'outline'} size={'icon'}><ArrowLeftIcon /></Button>
                <div id='email' className=' w-fit border-3 max-h-[75vh] rounded-lg border-dashed grid place-items-center overflow-auto p-5' >
                    <Email email={email} />
                </div>
                <Button variant={'outline'} size={'icon'}><ArrowRightIcon /></Button>


            </div>

            <Separator orientation='vertical' />

            <div className='flex flex-col w-[25%]  pb-10 pt-25'>
                <div className='flex-1 flex justify-between px-10 font-nunit'>
                    <div>
                        <p><strong>Team Name:</strong> {team?.teamName}</p>
                        <p><strong>Join Code:</strong> {team?.joinCode}</p>
                    </div>
                    <p><strong>Progress:</strong> 0 / 50</p>
                </div>
            </div>
        </div>
    )
}