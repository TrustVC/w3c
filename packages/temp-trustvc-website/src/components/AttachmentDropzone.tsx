import { cn } from "@/lib/utils";

interface AttachmentDropzoneProps {
  isDarkMode: boolean;
  dragActive: boolean;
  onDragEnter: React.DragEventHandler<HTMLDivElement>;
  onDragLeave: React.DragEventHandler<HTMLDivElement>;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDrop: React.DragEventHandler<HTMLDivElement>;
  onFileInput: React.ChangeEventHandler<HTMLInputElement>;
  fileInfoText: string;
}

const AttachmentDropzone = ({
  isDarkMode,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileInput,
  fileInfoText,
}: AttachmentDropzoneProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="form-label">Attachment</div>

      <div
        className={cn("dropbox-area", dragActive && "drag-active")}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="frame-dropbox-text">
          <div className="dropbox-text">
            Drop files here to upload screenshots
          </div>
        </div>
        <div className="frame-divider">
          <div className="divider-text">or</div>
        </div>
        <div className="standard-button-primary">
          <label
            htmlFor="contact-file-upload"
            className="contact-browse-button cursor-pointer inline-flex"
          >
            Browse Files
            <input
              id="contact-file-upload"
              type="file"
              multiple
              onChange={onFileInput}
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="frame-file-info">
        <div className="file-info-text">{fileInfoText}</div>
      </div>
    </div>
  );
};

export default AttachmentDropzone;
