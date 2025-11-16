
import { LogoutButton } from '@/features/auth/logout-button'
import Guard from './guard'

export default function Header() {
    return (
        <header className='h-20 bg-accent border-b-2 flex justify-between items-center px-16 z-1'>

            <div className='flex items-center gap-5 cursor-pointer'>
                <div className='h-10 w-10 overflow-hidden flex items-center justify-center'>
                    <img src='/htb.png' className='object-cover' />
                </div>
                <h3 className='font-bebas text-4xl tracking-wider'>Phishing</h3>
            </div>


            <nav className='flex items-center gap-5' >
                <Guard>
                    <LogoutButton />
                </Guard>
            </nav>

        </header>
    )
}
