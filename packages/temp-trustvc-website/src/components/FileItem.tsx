import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "@/types/attachment";
import { truncateFilename } from "@/types/attachment";

interface FileItemProps {
  item: AttachmentItem;
  onRemove: (id: string) => void;
  isDarkMode?: boolean;
}

export function FileItem({ item, onRemove, isDarkMode }: FileItemProps) {
  const { id, filename, status, progress, error } = item;
  const displayName = truncateFilename(filename, 36);
  const isUploading = status === "uploading" || status === "pending";
  const isError = status === "error";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 min-w-0",
        "bg-card border-border",
        isError && "border-destructive/50"
      )}
    >
      {/* Left: progress circle or preview placeholder */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-muted">
        {isUploading ? (
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted-foreground/30"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${progress * 1.02} 100`}
                strokeLinecap="round"
                className="text-primary transition-all duration-300"
              />
            </svg>
          </div>
        ) : isError ? (
          <span className="text-destructive text-xs font-medium">!</span>
        ) : (
          <span className="text-xs text-muted-foreground">Preview</span>
        )}
      </div>

      {/* Center: filename and status */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate" title={filename}>
          {displayName}
        </p>
        <p
          className={cn(
            "text-xs mt-0.5",
            isError ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {isUploading ? `Uploading - ${progress}%` : status === "uploaded" ? "Uploaded" : error || "Error"}
        </p>
      </div>

      {/* Right: remove */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${filename}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
