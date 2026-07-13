import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_PATHS = ["/privacy", "/terms"];

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (SCROLL_PATHS.includes(pathname)) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
