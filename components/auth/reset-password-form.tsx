"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    null
  );

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Enter your new password below.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {state && !state.success && "error" in state && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/login" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
          Back to login
        </Link>
      </p>
    </div>
  );
}
