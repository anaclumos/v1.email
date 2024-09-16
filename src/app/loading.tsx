import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin">
        <Loader2 className="size-12" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
