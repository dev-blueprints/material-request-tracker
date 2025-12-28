import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { House, Loader2 } from "lucide-react";

type AuthMode = "login" | "signup";

interface AuthPageProps {
  defaultMode?: AuthMode;
}

export function AuthPage({ defaultMode = "login" }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setMode(defaultMode);
    const sendReset = async () => {
      await supabase.auth.resetPasswordForEmail("psaurav25@gmail.com", {
        redirectTo: "https://sqkzxluvcjfbybykzcjh.supabase.co/reset-password",
      });
    };

    sendReset();
  }, [defaultMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_id: "550e8400-e29b-41d4-a716-446655440000",
              full_name: "New User",
            },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <House className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "login" ? "Sign in to Builder" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {mode === "login"
              ? "Enter your credentials to access your dashboard"
              : "Join your team and start managing materials"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            <Link to="/forgot-password" className="text-sm text-amber-600 hover:underline">
              Forgot password?
            </Link>

            <div className="text-center text-sm">
              <span className="text-slate-500">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </span>

              <Link
                to={mode === "login" ? "/signup" : "/login"}
                className="ml-1 text-amber-600 font-semibold hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
