// src/features/auth/components/logout-button.tsx
import { tokenStore } from "./use-team"
import { useNavigate } from "react-router"
import { LogOut } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"


export function LogoutButton() {
    const navigate = useNavigate()

    const logout = () => {
        tokenStore.clear()
        navigate('/')
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size='icon-lg' variant='outline'>
                    <LogOut />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout} >Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
