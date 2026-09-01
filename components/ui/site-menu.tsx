"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Every destination a reader might want from a sub-page. Order matches the
 *  numbered cards on the home page. */
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About me" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
];

/**
 * A fixed accent button that opens a slide-out panel of site links.
 *
 * Built on plain state and framer-motion rather than a dialog library: the
 * whole thing is four links, and the project only carries @radix-ui/react-slot
 * today. That means the accessibility work — escape to close, focus trapped
 * inside while open, focus returned to the button afterwards, the page behind
 * held still — is done explicitly below rather than inherited.
 */
export function SiteMenu() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close on navigation — including browser back/forward, which change the
  // path without going through a link. Adjusted during render rather than in
  // an effect so it lands in the same pass as the new route instead of causing
  // a second one. Deliberately not the `close` callback below: after a route
  // change the focus belongs on the new page, not back on the button.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;

    // Hold the page behind still while the panel is over it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      // Keep tabbing inside the panel — without this, focus walks off into the
      // page underneath, which is still there and still full of links.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    // Wait for the panel to arrive before moving focus into it, or the focus
    // ring appears on something still sliding in from off-screen.
    const focusTimer = window.setTimeout(
      () => panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus(),
      reduceMotion ? 0 : 260
    );

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, reduceMotion]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // A case study is still "Projects" as far as the menu is concerned.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const slide = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) track("menu_opened", { from_path: pathname });
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="fixed top-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-[#b60d06] text-white shadow-[0_6px_18px_rgba(43,38,34,0.22)] transition-colors hover:bg-[#8a0a04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b60d06] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ee] md:top-8 md:right-8"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              aria-hidden="true"
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="fixed inset-0 z-50 bg-[#2b2622]/35"
            />

            <motion.div
              key="panel"
              id="site-menu-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={slide}
              className="fixed top-0 right-0 z-[60] flex h-full w-[min(86vw,320px)] flex-col border-l border-[#e7ded2] bg-[#f7f3ee] px-8 pt-24 pb-10"
            >
              <p className="mb-8 font-mono text-[10px] font-medium tracking-[0.2em] text-[#8a8179] uppercase">
                Menu
              </p>

              <nav className="flex flex-col">
                {LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() =>
                        track("menu_navigated", {
                          destination: link.href,
                          label: link.label,
                          from_path: pathname,
                        })
                      }
                      className={cn(
                        "flex items-baseline gap-3 border-b border-[#e7ded2] py-4 font-serif text-[1.75rem] leading-none transition-colors last:border-b-0",
                        active ? "text-[#b60d06]" : "text-[#2b2622] hover:text-[#b60d06]"
                      )}
                    >
                      {/* Reserves its width whether or not the rule is drawn, so
                          the labels stay on one left edge. */}
                      <span
                        aria-hidden="true"
                        className="w-4 shrink-0 text-[#b60d06]"
                      >
                        {active ? "—" : ""}
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SiteMenu;
