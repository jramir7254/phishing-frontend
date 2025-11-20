import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Input, Button, Switch } from "@/components/ui";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { backend } from "@/lib/api";
import { toast } from "sonner";
import { tokenStore } from "./use-team";
import { useNavigate } from "react-router";

const loginSchema = z.object({
    joinCode: z.string().min(3, "Access code must be 6 characters."),
});

const registerSchema = z.object({
    teamName: z.string().min(5, "Team name must be at least 5 characters."),
});




export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(false);
    const navigate = useNavigate()

    const form = useForm({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
        defaultValues: { joinCode: "", teamName: "" },
    });

    useEffect(() => {
        form.reset();
    }, [isLogin]);

    const onSubmit = async (data: any) => {
        try {
            let token;
            if (isLogin) {
                token = await backend.post<string>({ root: 'auth', route: '/login', payload: data });
            } else {
                token = await backend.post<string>({ root: 'auth', route: '/register', payload: data });
            }
            if (token) {
                tokenStore.set(token)
                navigate('/instructions')
            }
        } catch (error: any) {
            toast.error(error?.message)
            form.setError('root.serverError', {
                type: 'manual',
                message: error.message,
            });
        }

    };

    const hasRootError = form.formState.errors.root?.serverError

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center rounded-2xl p-6 space-y-6"
        >

            {/* Access Code (sRegister Mode) */}
            <div className={isLogin ? "block" : "hidden"}>
                <Controller
                    name="joinCode"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className={hasRootError ? 'text-destructive animate-shake' : ''}>
                            <FieldLabel htmlFor="joinCode">Access Code</FieldLabel>
                            <InputOTP
                                id="joinCode"
                                maxLength={6}
                                value={field.value}
                                onChange={field.onChange}
                            >
                                <InputOTPGroup>
                                    {[0, 1, 2].map((i) => (
                                        <InputOTPSlot className="!bg-accent" key={i} index={i} />
                                    ))}
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    {[3, 4, 5].map((i) => (
                                        <InputOTPSlot className="!bg-accent" key={i} index={i} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                            {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </div>




            {/* Team Name (Login Mode) */}
            <div className={!isLogin ? "block" : "hidden"}>
                <Controller
                    name="teamName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className={hasRootError ? 'text-destructive animate-shake' : ''}>
                            <FieldLabel htmlFor="teamName">Team Name</FieldLabel>
                            <Input {...field} id="teamName" className="!bg-accent" />
                            {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </div>



            {/* Submit Button */}
            <Button type="submit" className="hidden">
                {isLogin ? "Login" : "Register"}
            </Button>


            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-3">
                <span className="text-sm font-medium">Register</span>
                <Switch className="!bg-purple-700"
                    checked={isLogin}
                    onCheckedChange={(checked) => setIsLogin(checked)}
                />
                <span className="text-sm font-medium">Login</span>
            </div>
        </form>
    );
}
