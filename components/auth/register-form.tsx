"use client";

import { useActionState, useEffect } from "react";
import { registerAction } from "@/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  useEffect(() => {
    if (state && !state.success) {
      toast.error(state.error);
    } else if (state && state.success) {
      toast.success("Account created successfully!");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            type="text" 
            autoComplete="name" 
            required 
            placeholder="Jane Doe"
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            autoComplete="new-password" 
            required 
          />
          <p className="text-xs text-zinc-500">Must be at least 6 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I want to...</Label>
          <Select name="role" defaultValue="student" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Learn (Student)</SelectItem>
              <SelectItem value="instructor">Teach (Instructor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign up"}
      </Button>

      <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Sign in
        </Link>
      </div>
    </form>
  );
}
