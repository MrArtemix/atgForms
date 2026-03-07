"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OAuthButton } from "@/components/auth/oauth-button";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-0 shadow-lg shadow-[hsl(var(--foreground))]/5 lg:border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-scale-in">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl animate-fade-in-up animate-stagger-1">Check your email</CardTitle>
          <CardDescription className="animate-fade-in-up animate-stagger-2">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-[hsl(var(--foreground))]">
              {email}
            </span>
            . Click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={() => setIsSuccess(false)}
              className="font-medium text-[hsl(var(--primary))] hover:underline"
            >
              Try again
            </button>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg shadow-[hsl(var(--foreground))]/5 lg:border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Get started with your free account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))] animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
              className="h-11 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
              className="h-11 transition-shadow duration-200 focus:shadow-md focus:shadow-[hsl(var(--primary))]/10"
            />
          </div>

          <Button type="submit" className="w-full h-11 active-press" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[hsl(var(--card))] px-2 text-[hsl(var(--muted-foreground))]">
              or continue with
            </span>
          </div>
        </div>

        <OAuthButton provider="google" />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
