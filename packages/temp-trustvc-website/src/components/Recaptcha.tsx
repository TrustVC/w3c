import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';

const SCRIPT_ID = 'recaptcha-v2-script';

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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);
    const siteKeyRef = useRef(siteKey);
    const onChangeRef = useRef(onChange);
    siteKeyRef.current = siteKey;
    onChangeRef.current = onChange;

    useEffect(() => {
      if (!siteKeyRef.current) return;

      const ensureRendered = () => {
        if (!containerRef.current || widgetIdRef.current !== null) return;
        if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
          return;
        }
        widgetIdRef.current = window.grecaptcha.render(
          containerRef.current,
          {
            sitekey: siteKeyRef.current,
            callback: (token: string) => {
              onChangeRef.current?.(token);
            },
          } as unknown as { sitekey: string },
        );
      };

      const loadScript = () => {
        if (document.getElementById(SCRIPT_ID)) {
          window.grecaptcha?.ready(ensureRendered);
          return;
        }
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.grecaptcha?.ready(ensureRendered);
        };
        document.head.appendChild(script);
      };

      loadScript();

      return () => {
        widgetIdRef.current = null;
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        async getToken() {
          if (!window.grecaptcha || widgetIdRef.current === null) return '';
          const token = window.grecaptcha.getResponse(widgetIdRef.current) || '';
          return token;
        },
        reset() {
          if (!window.grecaptcha || widgetIdRef.current === null) return;
          window.grecaptcha.reset(widgetIdRef.current);
        },
      }),
      [],
    );

    if (!siteKey) return null;

    return <div ref={containerRef} className={className} />;
  },
);
