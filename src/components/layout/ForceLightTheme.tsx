"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

/**
 * Forces light theme while mounted, restoring the previous theme on unmount.
 * Used in pre-login pages (marketing, login) where dark mode is disabled.
 */
export function ForceLightTheme() {
  const { setTheme, theme } = useTheme();
  const prevTheme = useRef(theme);

  useEffect(() => {
    prevTheme.current = theme;
    setTheme("light");
    return () => {
      if (prevTheme.current && prevTheme.current !== "light") {
        setTheme(prevTheme.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
