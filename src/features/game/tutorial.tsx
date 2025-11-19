import { Button } from '@/components/ui'
import { Heading } from '@/components/ui/typography'
import React, { useEffect, useLayoutEffect, useState } from 'react'

type Step = {
    target: string;   // CSS selector
    content?: string;
    className: string
};

export default function Tutorial() {
    const [steps, setSteps] = useState<Step[]>([
        { target: '#email', className: 'z-10' },
        { target: '', className: '' }
    ]);
    const [index, setIndex] = useState(0);
    useLayoutEffect(() => {
        if (steps.length === 0) return;
        const step = steps[index];
        const el = document.querySelector(step.target);

        if (el) {
            el.classList.add(step.className);

        }
    }, [steps, index]);

    useEffect(() => {
        // if (!currentTarget) return;

        const el = document.querySelector(steps[index].target);
        if (!el) return;

        el.classList.add("tutorial-highlight");

        return () => {
            el.classList.remove("tutorial-highlight");
        };
    }, [index]);

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
            <Heading>How to play</Heading>
            <Button onClick={next}>Next</Button>
        </div>
    )
}
