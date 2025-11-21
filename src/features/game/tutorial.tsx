import { Button } from '@/components/ui'
import { Heading } from '@/components/ui/typography'
import { backend } from '@/lib/api';
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router';

type Step = {
    target: string;   // CSS selector
    content?: string;
    className: string
};

export default function Tutorial() {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const navigate = useNavigate()
    const [index, setIndex] = useState(-1);
    const [steps, setSteps] = useState<Step[]>([
        { target: '#email', className: 'z-10', content: 'You will see an email in the center. Watch out for anything that may make it seem as a phish attempt.' },
        { target: '#legit-bttn', className: 'z-10 border-green-400! border-3 animate-pulse', content: 'Press this button if you think this is a legit email' },
        { target: '#phish-bttn', className: 'z-10 border-green-400! border-3 animate-pulse', content: 'Or press this button if you think this is a phishing email' },
        { target: '#timer', className: 'z-20! text-green-400! animate-pulse', content: 'You will have 15 minutes to complete this challenge' },
    ]);


    useLayoutEffect(() => {
        if (steps.length === 0) return;
        const step = steps[index];

        if (!step || !step.target) return

        const el = document.querySelector(step.target);

        if (el) {
            if (step.className) {

                el.classList.add(...step.className.split(" "));
            }
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
        } else {
            setTargetRect(null);
        }

        return () => {
            step.className && el?.classList.remove(...step.className.split(" "));
            setTargetRect(null)
        };
    }, [steps, index]);

    const startGame = async () => {
        await backend.post({ root: 'game', route: '/start' })
        navigate('/live')
    }

    function next() {
        if (index < steps.length - 1) setIndex(i => i + 1);
        else end();
    }

    function back() {
        if (index > 0) setIndex(i => i - 1);
    }

    function end() {
        setSteps([]);
    }
    return (
        <div className='absolute size-full bg-black/70'>
            <div className='p-20'>
                <Heading>How to play</Heading>
                <Button hidden={index >= 0} onClick={next}>Next</Button>

            </div>

            <div hidden={!!steps.length} className='absolute rounded-lg flex flex-col items-center justify-center inset-0 m-auto size-fit bg-accent  p-10 font-nunit'>
                <p>Press the start button to start the challenge</p>
                <Button onClick={startGame} >Start</Button>
            </div>


            {steps.length > 0 && targetRect && (
                <div
                    className="font-nunit absolute bg-accent p-4 rounded-lg shadow-lg z-[9999] w-72"
                    style={{
                        top: targetRect.top,
                        left: targetRect.left - 10,
                    }}
                >
                    <p>{steps[index].content}</p>

                    <div className="flex justify-between mt-3">
                        <Button disabled={index === 0} onClick={back}>
                            Back
                        </Button>
                        <Button onClick={next}>
                            {index === steps.length - 1 ? "Done" : "Next"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
