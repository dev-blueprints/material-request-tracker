import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Plus, Loader2, Info, AlertCircle } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useProjects } from "@/hooks/useMaterialRequests";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  material_name: z.string().min(2, "Material name is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  project_id: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: projects } = useProjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      material_name: "",
      quantity: 1,
      unit: "pcs",
      priority: "medium",
      notes: "",
      project_id: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        material_name: values.material_name,
        quantity: values.quantity,
        unit: values.unit,
        priority: values.priority,
        notes: values.notes,
        project_id: values.project_id || null,
        requested_by: user.id,
        company_id: user.app_metadata.company_id || user.user_metadata.company_id,
        status: "pending",
      };

      const { error } = await supabase.from("material_requests").insert(payload);

      if (error) throw error;

      finalizeSubmission();
    } catch (err: any) {
      console.error("Manual submission error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAISubmit = async () => {
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const companyId = user?.app_metadata.company_id || user?.user_metadata.company_id;

      const { data: parsedItems, error: aiError } = await supabase.functions.invoke(
        "parse-request",
        {
          body: { text: aiInput },
        }
      );

      if (aiError) throw aiError;

      let rawMaterials: any[] | null = null;

      if (Array.isArray(parsedItems)) {
        if (parsedItems.length > 0 && parsedItems[0]?.material_name) {
          rawMaterials = parsedItems;
        } else if (parsedItems.length > 0) {
          rawMaterials = parsedItems[0].material_requests || parsedItems[0].materials;
        } else {
          rawMaterials = [];
        }
      } else {
        rawMaterials = parsedItems?.material_requests || parsedItems?.materials;
      }

      if (!rawMaterials || !Array.isArray(rawMaterials)) {
        console.error("Unexpected AI response format:", parsedItems);
        throw new Error("AI returned data in an unexpected format");
      }

      const requestsToInsert = rawMaterials.map((item: any) => ({
        material_name: item.material_name,
        quantity: item.quantity,
        unit: item.unit || "pcs",
        priority: item.priority || "medium",
        requested_by: user?.id,
        company_id: companyId,
        status: "pending",
        project_id: null,
      }));


      const { error: dbError } = await supabase.from("material_requests").insert(requestsToInsert);

      if (dbError) throw dbError;
      finalizeSubmission();
    } catch (err: any) {
      console.error("AI submission error:", err);
      setError("AI was unable to parse the request. Please try manual entry or check your input.");
      setActiveTab("manual");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeSubmission = () => {
    queryClient.invalidateQueries({ queryKey: ["material_requests"] });
    setIsOpen(false);
    form.reset();
    setAiInput("");
    setError(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val: boolean) => {
        setIsOpen(val);
        if (!val) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Material Request</DialogTitle>
          <DialogDescription>
            Use AI to parse a note or fill out the form manually.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(val: string) => {
            setActiveTab(val);
            setError(null);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-3 h-3 text-amber-500" /> AI Quick-Add
            </TabsTrigger>
          </TabsList>

          {/* AI TAB CONTENT */}
          <TabsContent value="ai" className="space-y-4 pt-4">
            <div className="bg-amber-50 p-3 rounded-md border border-amber-100 flex gap-2 text-xs text-amber-800">
              <Info className="w-4 h-4 shrink-0" />
              <p>
                Paste your site notes here. The AI will extract items, quantities, and priority
                automatically.
              </p>
            </div>
            <Textarea
              placeholder="Example: 'I need 50 bags of concrete and 20kg of rebar for the Foundation project by tomorrow morning. Urgent.'"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="min-h-[120px] focus-visible:ring-amber-500"
            />
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleAISubmit}
              disabled={isProcessing || !aiInput}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Sparkles className="mr-2 w-4 h-4" />
              )}
              Analyze & Add Items
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="material_name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Material Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Portland Cement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="kg, bags, m3..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control as any}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-slate-900" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="animate-spin mr-2" /> : "Submit Request"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
