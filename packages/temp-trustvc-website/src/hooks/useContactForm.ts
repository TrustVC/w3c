import { useCallback, useMemo, useState } from 'react';
import {
  getPresignedUrls,
  uploadToPresignedUrl,
  createServiceRequestWithKeys,
} from '@/lib/supportApi';
import {
  MAX_TOTAL_UPLOAD_BYTES,
  MAX_FILES,
  isValidFileType,
  getFileConstraintText,
} from '@/lib/attachmentConfig';
import type { AttachmentItem } from '@/types/attachment';

export type EnquiryType = '' | 'General_Enquiry' | 'OpenCerts' | 'TradeTrust';

let idCounter = 0;
function nextId() {
  return `att-${++idCounter}-${Date.now()}`;
}

export const useContactForm = () => {
  const [email, setEmail] = useState('');
  const [typeOfEnquiry, setTypeOfEnquiry] = useState<EnquiryType>('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    typeOfEnquiry?: string;
    description?: string;
  }>({});
  const fileInfoText = useMemo(() => getFileConstraintText(), []);

  const totalBytes = useMemo(
    () => attachments.reduce((sum, a) => sum + a.file.size, 0),
    [attachments],
  );
  const allUploaded = useMemo(
    () => attachments.length === 0 || attachments.every((a) => a.status === 'uploaded'),
    [attachments],
  );
  const hasError = useMemo(() => attachments.some((a) => a.status === 'error'), [attachments]);
  const isUploading = useMemo(
    () => attachments.some((a) => a.status === 'uploading' || a.status === 'pending'),
    [attachments],
  );
  const isFormValid = useMemo(() => {
    const emailTrimmed = email.trim();
    const descriptionTrimmed = description.trim();
    return (
      !!emailTrimmed &&
      !!typeOfEnquiry &&
      !!descriptionTrimmed &&
      !hasError &&
      (attachments.length === 0 || allUploaded)
    );
  }, [email, typeOfEnquiry, description, hasError, attachments.length, allUploaded]);

  const setAttachmentStatus = useCallback(
    (
      id: string,
      update: Partial<Pick<AttachmentItem, 'status' | 'progress' | 'error' | 'key' | 'filename'>>,
    ) => {
      setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, ...update } : a)));
    },
    [],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const valid = newFiles.filter(isValidFileType);
      const invalidCount = newFiles.length - valid.length;
      if (invalidCount > 0) {
        setSubmitError('Some files were rejected. Only JPG, JPEG, and PNG files are allowed.');
      }
      if (valid.length === 0) return;

      const currentTotal = attachments.reduce((s, a) => s + a.file.size, 0);
      const addedTotal = valid.reduce((s, f) => s + f.size, 0);
      if (currentTotal + addedTotal > MAX_TOTAL_UPLOAD_BYTES) {
        setSubmitError('Attachments exceed 10 MB total size limit.');
        return;
      }
      if (attachments.length + valid.length > MAX_FILES) {
        setSubmitError(`Maximum ${MAX_FILES} files allowed.`);
        return;
      }

      const items: AttachmentItem[] = valid.map((file) => ({
        id: nextId(),
        file,
        filename: file.name,
        status: 'pending',
        progress: 0,
      }));
      setAttachments((prev) => [...prev, ...items]);
      setSubmitError(null);

      (async () => {
        try {
          const files = items.map((a) => ({
            filename: a.file.name,
            contentType: a.file.type || 'application/octet-stream',
            size: a.file.size,
          }));
          const presigned = await getPresignedUrls(files);
          await Promise.all(
            items.map((item, i) => {
              const p = presigned[i];
              if (!p) return Promise.resolve();
              setAttachmentStatus(item.id, { status: 'uploading', progress: 0 });
              return uploadToPresignedUrl(p.uploadUrl, item.file, (percent) => {
                setAttachmentStatus(item.id, { progress: percent });
              })
                .then(() => {
                  setAttachmentStatus(item.id, {
                    status: 'uploaded',
                    progress: 100,
                    key: p.key,
                    filename: p.filename,
                    previewUrl:
                      typeof URL !== 'undefined' ? URL.createObjectURL(item.file) : undefined,
                    error: undefined,
                  });
                })
                .catch((err) => {
                  setAttachmentStatus(item.id, {
                    status: 'error',
                    error: err instanceof Error ? err.message : 'Upload failed',
                  });
                });
            }),
          );
        } catch (err) {
          items.forEach((a) =>
            setAttachmentStatus(a.id, {
              status: 'error',
              error: err instanceof Error ? err.message : 'Failed to get upload URL',
            }),
          );
        }
      })();
    },
    [attachments, setAttachmentStatus],
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const toRemove = prev.find((a) => a.id === id);
      if (toRemove?.previewUrl && typeof URL !== 'undefined') {
        URL.revokeObjectURL(toRemove.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clearAllAttachments = useCallback(() => {
    setAttachments((prev) => {
      if (typeof URL !== 'undefined') {
        prev.forEach((a) => {
          if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
        });
      }
      return [];
    });
    setSubmitError(null);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files || []);
      addFiles(files);
    },
    [addFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      addFiles(files);
      e.target.value = '';
    },
    [addFiles],
  );

  const handleEmailChange = useCallback((value: React.SetStateAction<string>) => {
    setEmail(value);
    setFieldErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev));
  }, []);
  const handleTypeOfEnquiryChange = useCallback((value: React.SetStateAction<EnquiryType>) => {
    setTypeOfEnquiry(value);
    setFieldErrors((prev) => (prev.typeOfEnquiry ? { ...prev, typeOfEnquiry: undefined } : prev));
  }, []);
  const handleDescriptionChange = useCallback((value: React.SetStateAction<string>) => {
    setDescription(value);
    setFieldErrors((prev) => (prev.description ? { ...prev, description: undefined } : prev));
  }, []);

  const resetForm = useCallback(() => {
    setEmail('');
    setTypeOfEnquiry('');
    setDescription('');
    setAttachments([]);
    setDragActive(false);
    setFieldErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(null);
      setFieldErrors({});

      const emailTrimmed = email.trim();
      const descriptionTrimmed = description.trim();
      const errors: { email?: string; typeOfEnquiry?: string; description?: string } = {};
      if (!emailTrimmed) errors.email = 'Please enter your email address before submitting.';
      if (!typeOfEnquiry) errors.typeOfEnquiry = 'Please select an option before submitting.';
      if (!descriptionTrimmed) errors.description = 'Please enter a description before submitting.';
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      if (attachments.length > 0 && !allUploaded) {
        setSubmitError('Please wait for all files to finish uploading.');
        return;
      }
      if (hasError) {
        setSubmitError('Please remove failed files or try again.');
        return;
      }

      const baseUrl = import.meta.env?.VITE_SUPPORT_API_BASE_URL as string | undefined;
      if (!baseUrl) {
        setSubmitError('Missing VITE_SUPPORT_API_BASE_URL configuration.');
        return;
      }

      const domain =
        typeof window !== 'undefined'
          ? window.location.hostname
          : ((import.meta.env?.VITE_ENTRY_POINT as string) ?? 'trustvc.io');

      const attachmentKeys = attachments
        .filter((a) => a.status === 'uploaded' && a.key && a.filename)
        .map((a) => ({ key: a.key!, filename: a.filename }));

      try {
        setIsSubmitting(true);
        await createServiceRequestWithKeys({
          email: emailTrimmed,
          description: descriptionTrimmed,
          typeOfEnquiry,
          domain,
          attachmentKeys,
        });
        setSubmitSuccess("Request submitted successfully. We'll get back to you soon.");
        resetForm();
      } catch (err) {
        const msg =
          (err as { message?: string } | null | undefined)?.message ?? 'Failed to submit request.';
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, typeOfEnquiry, description, attachments, allUploaded, hasError, resetForm],
  );

  return {
    email,
    setEmail: handleEmailChange,
    typeOfEnquiry,
    setTypeOfEnquiry: handleTypeOfEnquiryChange,
    description,
    setDescription: handleDescriptionChange,
    attachments,
    addFiles,
    removeAttachment,
    clearAllAttachments,
    dragActive,
    isSubmitting,
    submitError,
    submitSuccess,
    fieldErrors,
    fileInfoText,
    totalBytes,
    allUploaded,
    isUploading,
    isFormValid,
    handleDrag,
    handleDrop,
    handleFileInput,
    onSubmit,
  };
};
