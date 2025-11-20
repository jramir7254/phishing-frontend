import { backend } from "@/lib/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function Countdown({ startTime, timeLimit }: { startTime: string | undefined, timeLimit: number }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate()
    if (!startTime) return <p className="text-xl font-nunit font-bold">15:00</p>

    useEffect(() => {
        const start = new Date(startTime).getTime();
        const end = start + timeLimit;

        const update = async () => {
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                await backend.post({ root: 'game', route: '/end' })
                navigate('results')
            }

            setTimeLeft(diff > 0 ? diff : 0);
        };

        update(); // initialize immediately
        const interval = setInterval(update, 1000);

        return () => clearInterval(interval);
    }, [startTime, timeLimit]);

    // Convert ms → mm:ss or hh:mm:ss
    const format = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return [
            hrs > 0 ? String(hrs).padStart(2, "0") : null,
            String(mins).padStart(2, "0"),
            String(secs).padStart(2, "0"),
        ]
            .filter(Boolean)
            .join(":");
    };

    return <div className="text-xl font-nunit font-bold">{format(timeLeft)}</div>;
}

export default Countdown;
