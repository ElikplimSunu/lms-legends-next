"use client";

import { useActionState, useEffect } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.error);
    } else if (state && state.success) {
      toast.success("Password reset email sent. Please check your inbox!");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            placeholder="you@example.com"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending link..." : "Send reset link"}
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Sign in
        </Link>
      </div>
    </form>
  );
}
