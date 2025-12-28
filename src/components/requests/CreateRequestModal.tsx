import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function CreateRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleAISubmit = async () => {
    setIsProcessing(true);
    try {
      // 1. Call the AI Edge Function
      const { data: parsedItems, error: aiError } = await supabase.functions.invoke(
        "parse-request",
        {
          body: { text: aiInput },
        }
      );

      if (aiError) throw aiError;

      // 2. FETCH USER ONCE (Optimized)
      // We get the user ID here so we don't have to 'await' inside the loop
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 3. Prepare the data for insertion
      const requestsToInsert = parsedItems.map((item: any) => ({
        ...item,
        company_id: user.app_metadata.company_id || user.user_metadata.company_id,
        requested_by: user.id,
        status: "pending",
        requested_at: new Date().toISOString(),
      }));

      // 4. Insert into Database
      const { error: dbError } = await supabase.from("material_requests").insert(requestsToInsert);

      if (dbError) throw dbError;

      // Success Handling
      queryClient.invalidateQueries({ queryKey: ["material_requests"] });
      setIsOpen(false);
      setAiInput("");
      alert("Requests added successfully!");
    } catch (err: any) {
      console.error("Error details:", err);
      alert(err.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Material Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 mb-2 text-amber-800 font-medium text-sm">
              <Sparkles className="w-4 h-4" /> AI Quick-Add
            </div>
            <Textarea
              placeholder="e.g., 'Need 20 bags of cement and 5 rolls of wire for the foundation. Urgent.'"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="bg-white border-amber-200 focus-visible:ring-amber-500"
            />
            <Button
              className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleAISubmit}
              disabled={isProcessing || !aiInput}
            >
              {isProcessing ? "Analyzing..." : "Process with AI"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or Manual Entry</span>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Open Standard Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
