"use client";

import type { ButtonHTMLAttributes } from "react";

type GoogleButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function GoogleButton({ className = "", ...props }: GoogleButtonProps) {
  return (
    <button
      type="button"
      className={`w-full max-w-[460px] h-14 rounded-xl border-2 border-[#101828] bg-white text-[#101828] text-sm md:text-base font-semibold flex items-center justify-center gap-3 shadow-sm hover:bg-[#F2F4F7] focus:outline-none focus:ring-2 focus:ring-[#0E9384]/40 focus:ring-offset-2 focus:ring-offset-[#F7F8FB] ${className}`}
      {...props}
    >
      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.1 0 5.9 1.1 8 2.9l6-6C34.2 2.4 29.4 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.4 5.7C11.9 13.2 17.5 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.1 24.6c0-1.7-.1-2.9-.4-4.2H24v8h12.5c-.5 2.6-2.1 4.8-4.6 6.2l7.1 5.5c4.2-3.9 6.1-9.7 6.1-15.5z"
          />
          <path
            fill="#FBBC05"
            d="M10.1 28.9c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-7.4-5.7C.9 18.1 0 21 0 24.5S.9 30.9 2.7 34.6l7.4-5.7z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.5 0 12-2.1 16-5.7l-7.1-5.5c-2 1.3-4.5 2-8.9 2-6.5 0-12.1-3.7-14.9-9l-7.4 5.7C6.7 42.6 14.7 48 24 48z"
          />
        </svg>
      </span>
      Entrar com o Google
    </button>
  );
}

export default GoogleButton;
