import { useEffect, useState } from "react";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useUpdateStatus } from "@/hooks/useUpdateStatus";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RequestStatus } from "@/types/database";
import { CreateRequestModal } from "@/components/requests/CreateRequestModal";
import { Loader2, Filter } from "lucide-react";
import { supabase } from "../lib/supabase";

export function MaterialRequestList() {
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const { data: requests, isLoading } = useMaterialRequests(filter === "all" ? undefined : filter);
  const { mutate: updateStatus } = useUpdateStatus();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Full User Metadata:", user?.user_metadata);
      console.log("Full App Metadata:", user?.app_metadata);
      console.log(
        "Company ID in Token:",
        user?.user_metadata?.company_id || user?.app_metadata?.company_id
      );
    };
    checkUser();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "fulfilled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Modal for creating new requests (including AI Twist) */}
        <CreateRequestModal />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Material</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              requests?.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.material_name}</TableCell>
                  <TableCell>
                    {req.quantity} {req.unit}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {req.projects?.name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold uppercase ${
                        req.priority === "urgent" ? "text-red-600" : "text-slate-400"
                      }`}
                    >
                      {req.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(req.status)}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus({ id: req.id, status: "approved" })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600"
                          onClick={() => updateStatus({ id: req.id, status: "rejected" })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {req.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus({ id: req.id, status: "fulfilled" })}
                      >
                        Mark Fulfilled
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
