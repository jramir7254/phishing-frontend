// import './styles.css'
import { Routes, Route, Navigate } from "react-router";


import Dev from './dev';
import Header from "./components/blocks/header";
import AuthPage from "./features/auth/auth-page";
import GamePage from "./features/game/game-page";
import AdminPage from "./features/admin/admin-page";
import ResultsPage from "./features/game/results-page";
import { Toaster } from "sonner";

export default function App() {

    return (
        <>
            <Header />
            <main className='flex w-screen relative '>
                <Routes>
                    {/* Public */}
                    {/* <Route path="/dev" element={<Dev />} /> */}
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/game" element={<GamePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
                <Toaster richColors position='top-center' />

            </main>
        </>
    );
}

