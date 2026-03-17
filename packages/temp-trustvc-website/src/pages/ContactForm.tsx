import { useTheme } from "@/components/ThemeProvider";
import { useRef, useState } from "react";
import { useContactForm } from "@/hooks/useContactForm";
import AttachmentDropzone from "@/components/AttachmentDropzone";
import { AttachmentFileList } from "@/components/AttachmentFileList";
import { FieldError } from "@/components/FieldError";
import { Recaptcha, type RecaptchaHandle } from "@/components/Recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env?.VITE_RECAPTCHA_SITE_KEY as string | undefined;

const ContactForm = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const recaptchaRef = useRef<RecaptchaHandle>(null);

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
    handleDrag,
    handleDrop,
    handleFileInput,
    validateEmail,
    validateTypeOfEnquiry,
    validateDescription,
    onSubmit,
    clearRecaptchaError,
    isFormValid,
  } = useContactForm({
    getRecaptchaToken: () =>
      RECAPTCHA_SITE_KEY
        ? (recaptchaRef.current?.getToken() ?? Promise.resolve(""))
        : Promise.resolve("dev-skip"),
    resetRecaptcha: () => recaptchaRef.current?.reset(),
    recaptchaRequired: !!RECAPTCHA_SITE_KEY,
  });

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

              {(submitError || submitSuccess) && (
                <div
                  className={
                    submitError ? "form-alert-error" : "form-alert-success"
                  }
                  role="alert"
                >
                  {submitError && (
                    <img
                      src="/icons/attention.svg"
                      alt=""
                      className="form-alert-error-icon"
                      aria-hidden="true"
                    />
                  )}
                  <span>{submitError ?? submitSuccess}</span>
                </div>
              )}

              <div className="mt-3 contact-form-divider" />

              <form className="mt-3 flex flex-col gap-5" onSubmit={onSubmit} noValidate>
                <div className="contact-form-fields">
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
                      onBlur={validateEmail}
                      className={`contact-input ${
                        fieldErrors.email ? "border-destructive" : ""
                      }`}
                      aria-invalid={!!fieldErrors.email}
                    />
                    {fieldErrors.email && (
                      <FieldError
                        message={fieldErrors.email}
                        id="contact-email-error"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="form-label" htmlFor="contact-enquiry">
                      Type of Enquiry *
                    </label>
                    <div
                      className="relative"
                      tabIndex={-1}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                          setIsDropdownOpen(false);
                        }
                        validateTypeOfEnquiry();
                      }}
                    >
                      <button
                        type="button"
                        id="contact-enquiry"
                        className={`contact-select flex items-center justify-between ${
                          fieldErrors.typeOfEnquiry ? "border-destructive" : ""
                        }`}
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                        onClick={() => setIsDropdownOpen((open) => !open)}
                      >
                        <span>
                          {typeOfEnquiry === ""
                            ? "Select an option."
                            : typeOfEnquiry === "General_Enquiry"
                              ? "General Enquiry"
                              : typeOfEnquiry}
                        </span>
                        <span
                          className={`inline-flex items-center absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        >
                          <img
                            src={
                              isDarkMode
                                ? "/icons/chevron-down-dark.svg"
                                : "/icons/chevron-down.svg"
                            }
                            alt=""
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                      {isDropdownOpen && (
                        <div
                          className="contact-select-menu"
                          role="listbox"
                          aria-labelledby="contact-enquiry"
                        >
                          <button
                            type="button"
                            className={`contact-select-option ${
                              typeOfEnquiry === "General_Enquiry"
                                ? "contact-select-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setTypeOfEnquiry("General_Enquiry");
                              setIsDropdownOpen(false);
                            }}
                          >
                            General Enquiry
                          </button>
                          <button
                            type="button"
                            className={`contact-select-option ${
                              typeOfEnquiry === "OpenCerts"
                                ? "contact-select-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setTypeOfEnquiry("OpenCerts");
                              setIsDropdownOpen(false);
                            }}
                          >
                            OpenCerts
                          </button>
                          <button
                            type="button"
                            className={`contact-select-option ${
                              typeOfEnquiry === "TradeTrust"
                                ? "contact-select-option-active"
                                : ""
                            }`}
                            onClick={() => {
                              setTypeOfEnquiry("TradeTrust");
                              setIsDropdownOpen(false);
                            }}
                          >
                            TradeTrust
                          </button>
                        </div>
                      )}
                    </div>
                    {fieldErrors.typeOfEnquiry && (
                      <FieldError
                        message={fieldErrors.typeOfEnquiry}
                        id="contact-enquiry-error"
                      />
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
                      onBlur={validateDescription}
                      className={`contact-textarea ${
                        fieldErrors.description ? "border-destructive" : ""
                      }`}
                      aria-invalid={!!fieldErrors.description}
                    />
                    {fieldErrors.description && (
                      <FieldError
                        message={fieldErrors.description}
                        id="contact-description-error"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
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
                  </div>
                  <AttachmentFileList
                    attachments={attachments}
                    onRemove={removeAttachment}
                    onClearAll={clearAllAttachments}
                    fileInfoText={fileInfoText}
                    isDarkMode={isDarkMode}
                  />
                  {fieldErrors.attachments && (
                    <FieldError
                      message={fieldErrors.attachments}
                      id="contact-attachments-error"
                    />
                  )}
                  {RECAPTCHA_SITE_KEY && (
                    <>
                      <Recaptcha
                        ref={recaptchaRef}
                        siteKey={RECAPTCHA_SITE_KEY}
                        className="flex justify-center items-center"
                        onChange={clearRecaptchaError}
                      />
                      {fieldErrors.recaptcha && (
                        <FieldError
                          message={fieldErrors.recaptcha}
                          id="contact-recaptcha-error"
                        />
                      )}
                    </>
                  )}
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`submit-button ${
                      isSubmitting || !isFormValid
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
