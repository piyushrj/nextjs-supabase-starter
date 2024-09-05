'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const REGEXP_ONLY_DIGITS = /^[0-9]+$/


export default function Login() {
    const [email, setEmail] = useState('')
    const [isSendingOTP, setIsSendingOTP] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
    const [allowSendOTP, setAllowSendOTP] = useState(true)
    const otpTimeOutRef = useRef<NodeJS.Timeout | null>(null)

    const supabase = createClient();
    const redirectURL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;

    const { toast } = useToast()
    const router = useRouter();


    async function handleGoogleLogin() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: redirectURL,
                },
            })
        } catch (error) {
            console.log(error);
        }

    }

    async function handleGitHubLogin() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: redirectURL,
                },
            })
        } catch (error) {
            console.log(error);
        }
    }

    async function sendOTP(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setOtpSent(false);
        setIsSendingOTP(true)

        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: redirectURL,
            },
        });

        if (error) {
            setIsSendingOTP(false);
            console.log('Error sending OTP');
            // console.log(error);
            toast({
                title: "Uh oh! Something went wrong.",
                description: "Please check if you entered your email correctly and try again.",
                variant: "destructive",
            })
        } else {
            console.log('OTP sent');

            setIsSendingOTP(false);
            setOtpSent(true);

            // clear existing timeouts
            if (otpTimeOutRef.current) {
                clearTimeout(otpTimeOutRef.current);
            }
            // set allowSendOTP to false so that the user cannot click on the button again
            setAllowSendOTP(false);
            // enable the button after 30 seconds
            otpTimeOutRef.current = setTimeout(() => {
                setAllowSendOTP(true);
            }, 30000);

        }
    }

    async function verifyOTP(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsVerifyingOTP(true);

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
            options: {
                redirectTo: redirectURL,
            },
        })

        setIsVerifyingOTP(false);

        if (error) {
            console.log('Error verifying OTP');
            // console.log(error);
            toast({
                title: "Invalid OTP",
                description: "Please check if you entered the correct OTP and try again.",
                variant: "destructive",
            })
        } else {
            console.log('OTP verified');
            router.refresh();
            router.push('/');
        }
    }


    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Login</h1>
                    <p className="text-muted-foreground">Choose an option to login to your account</p>
                </div>
                <div className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                        <Image src="/icons/google.svg" alt="Google" width={16} height={16} className="mr-2" />
                        Login with Google
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleGitHubLogin}>
                        <Image src="/icons/github.svg" alt="GitHub" width={16} height={16} className="mr-2" />
                        Login with GitHub
                    </Button>
                    <div className="flex items-center">
                        <hr className="flex-grow border-t border-muted-foreground/30" />
                        <p className="text-muted-foreground text-sm px-3">Or, login with your email</p>
                        <hr className="flex-grow border-t border-muted-foreground/30" />
                    </div>
                    <div>
                        <form className="flex gap-2" onSubmit={sendOTP}>
                            <Input type="email" placeholder="Enter your email" className="flex-1" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <Button type="submit" disabled={isSendingOTP || !allowSendOTP}>
                                {isSendingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </form>
                        <p className="mt-2 text-xs text-muted-foreground">{otpSent ? "Please enter the code sent to your email" : "We'll send you a one-time code to log in"}</p>
                    </div>
                    {otpSent && (
                        <div>
                            <form className="flex flex-col gap-2" onSubmit={verifyOTP}>
                                <InputOTP
                                    maxLength={6}
                                    pattern={REGEXP_ONLY_DIGITS.source}
                                    value={otp}
                                    onChange={(value) => setOtp(value)}
                                    className="w-full"
                                >
                                    <InputOTPGroup className="flex-1">
                                        <InputOTPSlot index={0} className="flex-1" />
                                        <InputOTPSlot index={1} className="flex-1" />
                                        <InputOTPSlot index={2} className="flex-1" />
                                        <InputOTPSlot index={3} className="flex-1" />
                                        <InputOTPSlot index={4} className="flex-1" />
                                        <InputOTPSlot index={5} className="flex-1" />
                                    </InputOTPGroup>
                                </InputOTP>
                                <Button type="submit" disabled={isVerifyingOTP || otp.length !== 6} className="w-full bg-[#00A364]/80 hover:bg-[#00A364]">
                                    {isVerifyingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify
                                </Button>
                            </form>
                        </div>
                    )}
                    {/* <div>
                        <form className="flex flex-col gap-2" onSubmit={verifyOTP}>
                            <InputOTP
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS.source}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                                className="w-full"
                            >
                                <InputOTPGroup className="flex-1">
                                    <InputOTPSlot index={0} className="flex-1" />
                                    <InputOTPSlot index={1} className="flex-1" />
                                    <InputOTPSlot index={2} className="flex-1" />
                                    <InputOTPSlot index={3} className="flex-1" />
                                    <InputOTPSlot index={4} className="flex-1" />
                                    <InputOTPSlot index={5} className="flex-1" />
                                </InputOTPGroup>
                            </InputOTP>
                            <Button type="submit" disabled={!otpSent || isVerifyingOTP || otp.length !== 6} className="w-full bg-[#00A364]/80 hover:bg-[#00A364]">
                                {isVerifyingOTP && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify
                            </Button>
                        </form>
                    </div> */}

                </div>
            </div>
            <footer className="mt-12 text-xs text-muted-foreground">
                <div className="flex gap-4">
                    <Link href="#" className="hover:underline" prefetch={false}>
                        Privacy Policy
                    </Link>
                    <Link href="#" className="hover:underline" prefetch={false}>
                        Terms of Service
                    </Link>
                </div>
            </footer>
        </div>
    )
}