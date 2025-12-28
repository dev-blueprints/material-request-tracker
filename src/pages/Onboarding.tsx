import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Building2, Users, Loader2, ArrowRight, HardHat } from "lucide-react";

export function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<"org" | "project">("org");
  const [loading, setLoading] = useState(false);

  // Form States
  const [companyName, setCompanyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [projectName, setProjectName] = useState("");

  // Temporary storage during wizard
  const [tempCompanyId, setTempCompanyId] = useState<string | null>(null);

  // Helper: Finalize everything
  const finalizeOnboarding = async (companyId: string) => {
    setLoading(true);
    try {
      // 1. Update the user's metadata so RLS works globally
      const { error } = await supabase.auth.updateUser({
        data: { company_id: companyId },
      });
      if (error) throw error;

      // 2. Trigger the App.tsx refresh
      onComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Create New Company
  const handleCreateOrg = async () => {
    setLoading(true);
    try {
      const code = `BUILD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { data, error } = await supabase
        .from("companies")
        .insert({ name: companyName, invite_code: code })
        .select()
        .single();

      if (error) throw error;

      setTempCompanyId(data.id);
      setStep("project"); // Move to Project Step
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Create Initial Project
  const handleCreateProject = async () => {
    if (!tempCompanyId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("projects").insert({
        name: projectName,
        company_id: tempCompanyId,
        location: "Initial Site",
      });

      if (error) throw error;

      await finalizeOnboarding(tempCompanyId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Join Existing
  const handleJoinOrg = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id")
        .eq("invite_code", inviteCode.trim())
        .single();

      if (error || !data) throw new Error("Invalid Invite Code");

      // If joining, we skip project creation (team already has some)
      await finalizeOnboarding(data.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <HardHat className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "org" ? "Setup Your Organization" : "Start Your First Project"}
          </CardTitle>
          <CardDescription>
            {step === "org"
              ? "Join a team or start a new company profile."
              : "Requests need to be linked to a specific job site."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "org" ? (
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">New Company</TabsTrigger>
                <TabsTrigger value="join">Join Team</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Company Name</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g. Skyline Builders"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-slate-900"
                  onClick={handleCreateOrg}
                  disabled={loading || !companyName}
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Next Step"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </TabsContent>

              <TabsContent value="join" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Invite Code</Label>
                  <Input
                    id="code"
                    placeholder="BUILD-XXXXXX"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleJoinOrg}
                  disabled={loading || !inviteCode}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Join Organization
                </Button>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g. Downtown Office Plaza"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={handleCreateProject}
                disabled={loading || !projectName}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Finish Setup & Enter Dashboard"
                )}
              </Button>
              <p className="text-xs text-center text-slate-500 mt-2">
                You can add more projects later in settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
