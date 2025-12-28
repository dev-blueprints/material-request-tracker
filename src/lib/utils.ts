import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function exportRequestsToCSV(requests: any[], filename: string) {
  // 1. Define the headers
  const headers = ["Material Name", "Quantity", "Unit", "Status", "Priority", "Project", "Requested At"];

  // 2. Map data to rows and handle escaping
  const rows = requests.map((req) => [
    req.material_name,
    req.quantity,
    req.unit,
    req.status,
    req.priority,
    req.projects?.name || "N/A",
    new Date(req.requested_at).toLocaleDateString(),
  ]);

  // 3. Convert to CSV string with proper escaping
  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const stringValue = cell?.toString() || "";
          // Escape quotes and wrap in quotes if it contains commas, quotes, or newlines
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");

  // 4. Create a Blob and trigger download
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