import { Separator } from "@/components/ui";

type EmailProps = {
    id: string;
    subject: string;
    from: string;
    to?: string;
    date: string;
    html: string;
};

export default function Email({ email }: { email: EmailProps }) {
    // Split sender name and address for display clarity
    const [senderName, senderEmail] = email?.from.includes("<")
        ? email.from.split("<").map(s => s.replace(">", "").trim())
        : [email.from, ""];

    return (
        <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-4  dark:text-accent size-fit" id={email.id}>
            <header className="">
                <div>
                    <h3 className=""><strong>Subject: </strong>{email.subject}</h3>
                    <p className="">
                        <strong>From: </strong>{senderName}{" "}
                        {senderEmail && <span>&lt;{senderEmail}&gt;</span>} <br />
                        {email.date && <span>&lt;{email.date}&gt;</span>}
                    </p>
                </div>
            </header>

            <Separator />

            {/* Body content (safe, sanitized HTML) */}
            <section
                className=""
                dangerouslySetInnerHTML={{ __html: email.html }}
            />
        </article>
    );
}