import { useEffect, useRef } from 'react';

const SCRIPT_ID = 'recaptcha-v2-script';

type UseRecaptchaOptions = {
  siteKey: string | null | undefined;
  onChange?: (token: string) => void;
};

export const useRecaptcha = ({ siteKey, onChange }: UseRecaptchaOptions) => {
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

      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKeyRef.current,
        callback: (token: string) => {
          onChangeRef.current?.(token);
        },
      } as unknown as { sitekey: string });
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

  const getToken = async (): Promise<string> => {
    if (!window.grecaptcha || widgetIdRef.current === null) return '';
    return window.grecaptcha.getResponse(widgetIdRef.current) || '';
  };

  const reset = () => {
    if (!window.grecaptcha || widgetIdRef.current === null) return;
    window.grecaptcha.reset(widgetIdRef.current);
  };

  return { containerRef, getToken, reset };
};
