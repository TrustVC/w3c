import React, { useImperativeHandle, forwardRef } from 'react';
import { useRecaptcha } from './useRecaptcha';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (container: HTMLElement, params: { sitekey: string }) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
  }
}

export interface RecaptchaHandle {
  /** Returns a Promise that resolves with the reCAPTCHA v2 checkbox token. */
  getToken: () => Promise<string>;
  reset: () => void;
}

interface RecaptchaProps {
  siteKey: string;
  className?: string;
  onChange?: (token: string) => void;
}

export const Recaptcha = forwardRef<RecaptchaHandle, RecaptchaProps>(
  function Recaptcha({ siteKey, className, onChange }, ref) {
    const { containerRef, getToken, reset } = useRecaptcha({
      siteKey,
      onChange,
    });

    useImperativeHandle(
      ref,
      () => ({
        getToken,
        reset,
      }),
      [getToken, reset],
    );

    if (!siteKey) return null;

    return <div ref={containerRef} className={className} />;
  },
);
