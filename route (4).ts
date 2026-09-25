import { createSheetHandlers } from "@/lib/api";

export const dynamic = "force-dynamic";
export const { GET, POST } = createSheetHandlers("service");
