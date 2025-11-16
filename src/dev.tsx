import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Email = {
    id: string;
    subject: string;
    from: string;
    to?: string;
    date: string;
    html: string;
    category?: string;
};

type EmailModule = { default: Email[] } | Email[];

const emailModules = import.meta.glob('./*.json', { eager: true }) as Record<string, EmailModule>;

const EMAIL_FILES: Record<string, Email[]> = Object.entries(emailModules).reduce((acc, [path, mod]) => {
    const key = path.replace('./', '');
    const data = Array.isArray((mod as { default?: Email[] }).default)
        ? (mod as { default: Email[] }).default
        : (mod as Email[]);

    acc[key] = data ?? [];
    return acc;
}, {} as Record<string, Email[]>);

const FILE_OPTIONS = Object.keys(EMAIL_FILES).sort();

function cloneEmails(fileName: string): Email[] {
    return (EMAIL_FILES[fileName] ?? []).map(email => ({ ...email }));
}

export default function Dev() {
    const hasFiles = FILE_OPTIONS.length > 0;
    const [selectedFile, setSelectedFile] = useState<string>(hasFiles ? FILE_OPTIONS[0] : '');
    const [emails, setEmails] = useState<Email[]>(() => (selectedFile ? cloneEmails(selectedFile) : []));
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        if (!selectedFile) {
            setEmails([]);
            setActiveId('');
            return;
        }

        const nextEmails = cloneEmails(selectedFile);
        setEmails(nextEmails);
        setActiveId(nextEmails[0]?.id ?? '');
    }, [selectedFile]);

    useEffect(() => {
        if (!emails.length) {
            setActiveId('');
            return;
        }
        if (!emails.some(email => email.id === activeId)) {
            setActiveId(emails[0].id);
        }
    }, [emails, activeId]);

    const activeEmail = useMemo(
        () => emails.find(email => email.id === activeId) ?? null,
        [emails, activeId]
    );

    const handleFieldChange = (field: keyof Email, value: string) => {
        if (!activeEmail) return;
        setEmails(prev =>
            prev.map(email => (email.id === activeEmail.id ? { ...email, [field]: value } : email)),
        );
    };

    const handleSave = () => {
        if (!selectedFile) return;
        const blob = new Blob([JSON.stringify(emails, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = selectedFile;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (!selectedFile) return;
        setEmails(cloneEmails(selectedFile));
    };

    return (
        <section className="max-h-screen size-fullflex flex-col">
            {/* Toolbar */}
            <header className="flex justify-between items-end p-4 px-6 bg-accent border-b border-slate-200 gap-4">
                <div className="flex flex-col min-w-[240px] font-semibold gap-2">
                    <label htmlFor="fileSelect">JSON file</label>
                    <select
                        id="fileSelect"
                        value={selectedFile}
                        onChange={event => setSelectedFile(event.target.value)}
                        disabled={!hasFiles}
                        className="p-2.5 px-3 border border-slate-300 rounded-lg text-[0.95rem]"
                    >
                        {!hasFiles && <option value="">No JSON files detected</option>}
                        {FILE_OPTIONS.map(file => (
                            <option key={file} value={file}>
                                {file}
                            </option>
                        ))}
                    </select>

                    {!hasFiles && (
                        <small>
                            Add a JSON file under <code className="bg-accent px-2 py-0.5 rounded-md">src/</code> to
                            begin.
                        </small>
                    )}
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!emails.length}
                        className="rounded-lg px-5 py-2.5 font-semibold text-sm bg-blue-700 text-white transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Download {selectedFile || 'file'}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!emails.length}
                        className="rounded-lg px-5 py-2.5 font-semibold text-sm bg-slate-600 text-white transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset changes
                    </button>
                </div>
            </header>

            {/* Main layout */}
            <section
                className="
                    flex-1 grid grid-cols-[240px_1fr_1fr] gap-4 p-4 px-6 pt-4
                    max-[1100px]:grid-cols-1 max-[1100px]:grid-rows-[auto_auto_auto]
                "
            >
                {/* Email list */}
                <aside className="bg-accent border border-slate-200 rounded-xl p-4 flex flex-col min-h-0">
                    <h2 className="mb-3 text-base font-medium">Emails ({emails.length})</h2>

                    <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                        {emails.map(email => (
                            <button
                                key={email.id}
                                type="button"
                                onClick={() => setActiveId(email.id)}
                                className={
                                    email.id === activeId
                                        ? `text-left border border-blue-600 bg-white/8-0 rounded-lg p-3 flex flex-col gap-1.5`
                                        : `text-left border border-transparent bg-black rounded-lg p-3 flex flex-col gap-1.5`
                                }
                            >
                                <span className="font-semibold text-[0.95rem]">
                                    {email.subject || '(No subject)'}
                                </span>
                                <span className="text-[0.8rem] text-slate-600">
                                    {email.from || 'Unknown sender'}
                                </span>
                            </button>
                        ))}

                        {!emails.length && (
                            <p className="text-slate-400 text-center py-4">No emails in this file.</p>
                        )}
                    </div>
                </aside>

                {/* Preview */}
                <section className="bg-accent border border-slate-200 rounded-xl p-4 flex flex-col min-h-0">
                    <h2 className="mb-3 text-base font-medium">Preview</h2>

                    {activeEmail ? (
                        <article className="flex flex-col gap-4 flex-1 overflow-hidden">
                            <div className="grid gap-3 p-3 bg-accent rounded-md grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
                                <div>
                                    <p className="text-[0.75rem] uppercase text-slate-500 mb-1">Subject</p>
                                    <p className="font-semibold">{activeEmail.subject || 'Untitled email'}</p>
                                </div>
                                <div>
                                    <p className="text-[0.75rem] uppercase text-slate-500 mb-1">From</p>
                                    <p className="font-semibold">{activeEmail.from || 'Unknown sender'}</p>
                                </div>
                                <div>
                                    <p className="text-[0.75rem] uppercase text-slate-500 mb-1">To</p>
                                    <p className="font-semibold">{activeEmail.to || 'n/a'}</p>
                                </div>
                                <div>
                                    <p className="text-[0.75rem] uppercase text-slate-500 mb-1">Date</p>
                                    <p className="font-semibold">{activeEmail.date || 'n/a'}</p>
                                </div>
                            </div>

                            <div
                                className="flex-1 overflow-auto border border-slate-200 rounded-md p-4 bg-white"
                                dangerouslySetInnerHTML={{ __html: activeEmail.html }}
                            />
                        </article>
                    ) : (
                        <p className="text-slate-400 text-center py-4">Select an email to preview it here.</p>
                    )}
                </section>

                {/* Editor */}
                <section className="bg-accent border border-slate-200 rounded-xl p-4 flex flex-col min-h-0">
                    <h2 className="mb-3 text-base font-medium">Editor</h2>

                    {activeEmail ? (
                        <form className="flex flex-col gap-3 flex-1">
                            <label className="text-[0.85rem] font-semibold flex flex-col gap-1.5">
                                Subject
                                <input
                                    type="text"
                                    value={activeEmail.subject}
                                    onChange={event => handleFieldChange('subject', event.target.value)}
                                    className="border border-slate-300 rounded-lg p-2.5 px-3 text-[0.9rem] font-inherit"
                                />
                            </label>

                            <label className="text-[0.85rem] font-semibold flex flex-col gap-1.5">
                                From
                                <input
                                    type="text"
                                    value={activeEmail.from}
                                    onChange={event => handleFieldChange('from', event.target.value)}
                                    className="border border-slate-300 rounded-lg p-2.5 px-3 text-[0.9rem] font-inherit"
                                />
                            </label>

                            <label className="text-[0.85rem] font-semibold flex flex-col gap-1.5">
                                To
                                <input
                                    type="text"
                                    value={activeEmail.to ?? ''}
                                    onChange={event => handleFieldChange('to', event.target.value)}
                                    className="border border-slate-300 rounded-lg p-2.5 px-3 text-[0.9rem] font-inherit"
                                />
                            </label>

                            <label className="text-[0.85rem] font-semibold flex flex-col gap-1.5">
                                Date
                                <input
                                    type="text"
                                    value={activeEmail.date}
                                    onChange={event => handleFieldChange('date', event.target.value)}
                                    className="border border-slate-300 rounded-lg p-2.5 px-3 text-[0.9rem] font-inherit"
                                />
                            </label>

                            <label className="text-[0.85rem] font-semibold flex flex-col gap-1.5">
                                HTML
                                <textarea
                                    value={activeEmail.html}
                                    onChange={event => handleFieldChange('html', event.target.value)}
                                    className="border border-slate-300 rounded-lg p-2.5 px-3 text-[0.9rem] min-h-[220px] resize-y font-inherit"
                                />
                            </label>
                        </form>
                    ) : (
                        <p className="text-slate-400 text-center py-4">Pick an email from the list to edit its fields.</p>
                    )}
                </section>
            </section>

            <footer className="text-center text-[0.85rem] p-4 pb-6 text-slate-600">
                Downloaded files include your edits. Replace the original JSON under{' '}
                <code className="bg-slate-200 px-2 py-0.5 rounded-md">src/</code> if you want the changes to persist.
            </footer>
        </section>
    );
}

