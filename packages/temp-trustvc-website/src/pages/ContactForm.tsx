import { useTheme } from "@/components/ThemeProvider";
import { useContactForm } from "@/hooks/useContactForm";
import AttachmentDropzone from "@/components/AttachmentDropzone";
import { AttachmentFileList } from "@/components/AttachmentFileList";

const ContactForm = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const {
    email,
    setEmail,
    typeOfEnquiry,
    setTypeOfEnquiry,
    description,
    setDescription,
    attachments,
    removeAttachment,
    clearAllAttachments,
    dragActive,
    isSubmitting,
    submitError,
    submitSuccess,
    fieldErrors,
    fileInfoText,
    allUploaded,
    isUploading,
    handleDrag,
    handleDrop,
    handleFileInput,
    onSubmit,
  } = useContactForm();

  return (
    <div className="w-full px-4 pt-[120px] pb-16 flex justify-center">
      <div className="w-full max-w-[1440px] flex flex-col items-center">
        <div className="w-full max-w-[760px] flex flex-col items-center text-center">
          <h1 className="contact-heading">
            <span className="contact-heading-contact">Contact</span>{" "}
            <span className="contact-heading-us">Us</span>
          </h1>
          <p className="contact-description mt-3">
            Get help with TrustVC product and services. We&apos;ll get back to
            you soon
          </p>
        </div>

        <div className="w-full max-w-[920px] mt-10">
          <div className="overlay-border-shadow">
            <div className="w-full py-6 px-4 sm:py-8 sm:px-6">
              <div className="flex flex-col gap-1">
                <div className="submit-request-title text-foreground">
                  Submit a Request
                </div>
                <div className="encountering-issues-text text-muted-foreground">
                  Encountering some issues? Let us know so that we can help.
                </div>
              </div>

              <div className="mt-5 contact-form-divider" />

              <form className="mt-3 flex flex-col gap-5" onSubmit={onSubmit}>
                <div className="contact-form-fields">
                  {(submitError || submitSuccess) && (
                    <div
                      className={
                        submitError ? "form-alert-error" : "form-alert-success"
                      }
                      role="alert"
                    >
                      {submitError ?? submitSuccess}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="form-label" htmlFor="contact-email">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="your.name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`contact-input ${
                        fieldErrors.email ? "border-destructive" : ""
                      }`}
                      aria-invalid={!!fieldErrors.email}
                    />
                    {fieldErrors.email && (
                      <p
                        className="text-xs font-medium text-red-500"
                        role="alert"
                      >
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="form-label" htmlFor="contact-enquiry">
                      Type of Enquiry *
                    </label>
                    <select
                      id="contact-enquiry"
                      value={typeOfEnquiry}
                      onChange={(e) =>
                        setTypeOfEnquiry(
                          e.target.value as
                            | "General_Enquiry"
                            | "OpenCerts"
                            | "TradeTrust"
                            | ""
                        )
                      }
                      className={`contact-select ${
                        fieldErrors.typeOfEnquiry ? "border-destructive" : ""
                      }`}
                      aria-invalid={!!fieldErrors.typeOfEnquiry}
                    >
                      <option value="" disabled>
                        Select an option.
                      </option>
                      <option value="General_Enquiry">General Enquiry</option>
                      <option value="OpenCerts">OpenCerts</option>
                      <option value="TradeTrust">TradeTrust</option>
                    </select>
                    {fieldErrors.typeOfEnquiry && (
                      <p
                        className="text-xs font-medium text-red-500"
                        role="alert"
                      >
                        {fieldErrors.typeOfEnquiry}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="form-label" htmlFor="contact-description">
                      Description *
                    </label>
                    <textarea
                      id="contact-description"
                      placeholder="Please provide more information about your issue."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`contact-textarea ${
                        fieldErrors.description ? "border-destructive" : ""
                      }`}
                      aria-invalid={!!fieldErrors.description}
                    />
                    {fieldErrors.description && (
                      <p
                        className="text-xs font-medium text-red-500"
                        role="alert"
                      >
                        {fieldErrors.description}
                      </p>
                    )}
                  </div>

                  <AttachmentDropzone
                    isDarkMode={isDarkMode}
                    dragActive={dragActive}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onFileInput={handleFileInput}
                    fileInfoText={fileInfoText}
                  />
                  <AttachmentFileList
                    attachments={attachments}
                    onRemove={removeAttachment}
                    onClearAll={clearAllAttachments}
                    fileInfoText={fileInfoText}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !allUploaded}
                    className={`submit-button ${
                      isSubmitting || isUploading
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
