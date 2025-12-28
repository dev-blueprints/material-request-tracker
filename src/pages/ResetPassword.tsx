import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { House } from "lucide-react";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      navigate("/login", { replace: true });
    } catch (err) {
      alert("Password reset failed");
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
            Sign in to Builder
          </CardTitle>
          <CardDescription className="text-slate-500">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleReset} className="p-8">
          <div className="w-full max-w-sm space-y-4">
            <Input
              type="password"
              placeholder="New password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
