'use client'

import { createClient } from "@/utils/supabase/client"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function SignOutButton() {
    const [isSigningOut, setIsSigningOut] = useState(false)

    const router = useRouter()

    async function handleSignOut() {
        setIsSigningOut(true);
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        setIsSigningOut(false)
        // redirect the user to the login page
        router.push('/login')
    }

    return (
        <Button onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Out
        </Button>
    )
}