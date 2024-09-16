import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center p-12">
      <div className="animate-spin">
        <Loader2 className="h-12 w-12" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
