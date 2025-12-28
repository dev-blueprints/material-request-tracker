import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function exportRequestsToCSV(requests: any[], filename: string) {
  const headers = ["Material Name", "Quantity", "Unit", "Status", "Priority", "Project", "Requested At"];

  const rows = requests.map((req) => [
    req.material_name,
    req.quantity,
    req.unit,
    req.status,
    req.priority,
    req.projects?.name || "N/A",
    new Date(req.requested_at).toLocaleDateString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const stringValue = cell?.toString() || "";
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");


  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}