import { Flex } from '@/components/blocks';
import AuthForm from './auth-form';
export default function AuthPage() {


    return (
        <Flex centered className="flex-1 relative bg-transparent">
            <Flex centered className='z-1' onFocus={() => console.log('f')}>
                <h1 className='text-6xl font-aldri select-none'>Phishing</h1>
                <AuthForm />
            </Flex>
        </Flex>
    );
}






