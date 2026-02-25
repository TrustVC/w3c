import { Trash2 } from "lucide-react";
import { FileItem } from "./FileItem";
import type { AttachmentItem } from "@/types/attachment";

interface AttachmentFileListProps {
  attachments: AttachmentItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  fileInfoText: string;
  isDarkMode?: boolean;
}

export function AttachmentFileList({
  attachments,
  onRemove,
  onClearAll,
  fileInfoText,
  isDarkMode,
}: AttachmentFileListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Files
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {attachments.map((item) => (
          <FileItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
}
