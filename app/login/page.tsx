"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signUp } from "@/app/auth/actions";
// import { useSearchParams } from "next/navigation"; // No longer needed

export default function LoginPage() {
  const [password, setPassword] = useState("");
  // const searchParams = useSearchParams(); // No longer needed
  // const message = searchParams.get("message"); // No longer needed
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      <div className="login-background"></div>
      <Tabs defaultValue="login" className="w-full max-w-lg z-10 form-background" onValueChange={() => {
        setLoginError(null);
        setRegistrationError(null);
      }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white text-slate-400">Login</TabsTrigger>
          <TabsTrigger value="register" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-white text-slate-400">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="border border-slate-700">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Log in to your AniSwipe account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const result = await signIn(formData);
                  if (!result.success) {
                    setLoginError(result.error || "An unknown error occurred.");
                  } else {
                    window.location.href = "/swipe"; // Redirect on successful login
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-700"
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <Button className="w-full" type="submit" variant="cta">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card className="border border-slate-700">
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>
                Create a new AniSwipe account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const result = await signUp(formData);
                  if (!result.success) {
                    setRegistrationError(result.error || "An unknown error occurred.");
                  } else {
                    window.location.href = "/login?message=Check your email for the confirmation link."; // Redirect on successful registration
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    name="username"
                    type="text"
                    placeholder="yourusername"
                    required
                    className="border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-slate-700"
                  />
                </div>
                {registrationError && <p className="text-red-500 text-sm">{registrationError}</p>}
                <Button className="w-full" type="submit" variant="cta">
                  Register
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}