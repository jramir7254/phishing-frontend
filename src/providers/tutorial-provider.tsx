import React, { createContext, useContext, useState, useRef, useLayoutEffect } from "react";

type Step = {
    target: string;   // CSS selector
    content: string;
};

type TutorialContextType = {
    start: (steps: Step[]) => void;
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const [steps, setSteps] = useState<Step[]>([]);
    const [index, setIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Get DOM position of target each time step changes
    useLayoutEffect(() => {
        if (steps.length === 0) return;
        const step = steps[index];
        const el = document.querySelector(step.target);

        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
        } else {
            setTargetRect(null);
        }
    }, [steps, index]);

    function start(newSteps: Step[]) {
        setSteps(newSteps);
        setIndex(0);
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
        <TutorialContext.Provider value={{ start }}>
            {children}

            {/* Overlay */}
            {steps.length > 0 && (
                <div className="fixed inset-0 bg-black/50 z-[9998]" />
            )}

            {/* Tooltip */}
            {steps.length > 0 && targetRect && (
                <div
                    className="absolute bg-white text-black p-4 rounded shadow-lg z-[9999] w-72"
                    style={{
                        top: targetRect.bottom + 10,
                        left: targetRect.left,
                    }}
                >
                    <p>{steps[index].content}</p>

                    <div className="flex justify-between mt-3">
                        <button disabled={index === 0} onClick={back}>
                            Back
                        </button>
                        <button onClick={next}>
                            {index === steps.length - 1 ? "Done" : "Next"}
                        </button>
                    </div>
                </div>
            )}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const ctx = useContext(TutorialContext);
    if (!ctx) throw new Error("useTutorial must be within TutorialProvider");
    return ctx;
}
