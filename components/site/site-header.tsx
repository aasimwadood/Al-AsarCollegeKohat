"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, type NavGroup } from "@/lib/site/navigation";
import { SITE } from "@/lib/site/config";
import { BrandMark } from "./brand-mark";

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader({ dashboardHref }: { dashboardHref: string | null }) {
  const isAuthenticated = !!dashboardHref;
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuIdBase = useId();

  // Close menus on navigation.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu, mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const hoverOpen = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const hoverClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  const portalHref = dashboardHref ?? "/login";

  return (
    <header className="sticky top-0 z-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-sand-50 focus:px-4 focus:py-2 focus:text-forest-900">
        Skip to content
      </a>

      {/* Ribbon */}
      <div className={cn("bg-forest-950 text-sand-200 transition-[margin] duration-300", scrolled && "lg:-mt-9")}>
        <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between gap-4 px-4 text-[0.8125rem] sm:px-6 lg:px-8">
          <p className="truncate">
            <span className="hidden sm:inline">Affiliated with </span>
            <span className="sm:hidden">Affiliated: </span>
            <span className="text-sand-50">{SITE.affiliation}</span>
          </p>
          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <Link href="/news" className="hover:text-white">
              Announcements
            </Link>
            <Link href="/recruitment" className="hover:text-white">
              Careers
            </Link>
            <Link href={portalHref} className="inline-flex items-center gap-1.5 text-brass-400 hover:text-white">
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              {isAuthenticated ? "My Dashboard" : "Portal Login"}
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        ref={navRef}
        className={cn(
          "relative border-b border-line bg-sand-50/95 backdrop-blur-sm transition-shadow duration-300",
          scrolled && "shadow-[0_8px_24px_-16px_rgb(22_48_36/0.35)]",
        )}
      >
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label={`${SITE.name} — home`}>
            <BrandMark className="h-11" />
            <span className="leading-none">
              <span className="font-display block text-[1.45rem] font-semibold tracking-[-0.01em] text-forest-900">Al-Asar</span>
              <span className="mt-1 block text-[0.6875rem] font-medium tracking-[0.14em] whitespace-nowrap text-brass-700 uppercase">
                Degree College · Kohat
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center">
              {PRIMARY_NAV.map((group, index) => {
                const active = isActive(pathname, group.href);
                const menuId = `${menuIdBase}-menu-${index}`;
                if (!group.columns) {
                  return (
                    <li key={group.label}>
                      <Link
                        href={group.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative block px-2.5 py-2 text-[0.9375rem] whitespace-nowrap text-ink transition-colors hover:text-forest-800",
                          active && "text-forest-900 after:absolute after:inset-x-2.5 after:-bottom-[21px] after:h-[2px] after:bg-brass-500",
                        )}
                      >
                        {group.label}
                      </Link>
                    </li>
                  );
                }
                const open = openMenu === group.label;
                return (
                  <li key={group.label} onMouseEnter={() => hoverOpen(group.label)} onMouseLeave={hoverClose}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={menuId}
                      onClick={() => setOpenMenu(open ? null : group.label)}
                      className={cn(
                        "relative flex items-center gap-1 px-2.5 py-2 text-[0.9375rem] whitespace-nowrap text-ink transition-colors hover:text-forest-800",
                        (active || open) && "text-forest-900",
                        active && "after:absolute after:inset-x-2.5 after:-bottom-[21px] after:h-[2px] after:bg-brass-500",
                      )}
                    >
                      {group.label}
                      <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform", open && "rotate-180")} aria-hidden="true" />
                    </button>
                    <MegaPanel group={group} id={menuId} open={open} onEnter={() => hoverOpen(group.label)} onLeave={hoverClose} />
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admissions"
              className="hidden min-h-11 items-center rounded-[3px] bg-forest-800 px-5 text-[0.9375rem] font-medium whitespace-nowrap text-sand-50 transition-colors hover:bg-forest-900 sm:inline-flex"
            >
              Admissions
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-line text-forest-900 xl:hidden"
              aria-expanded={mobileOpen}
              aria-controls="aa-mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} portalHref={portalHref} isAuthenticated={isAuthenticated} />
    </header>
  );
}

function MegaPanel({ group, id, open, onEnter, onLeave }: { group: NavGroup; id: string; open: boolean; onEnter: () => void; onLeave: () => void }) {
  return (
    <div
      id={id}
      hidden={!open}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full border-t border-line bg-sand-50 shadow-[0_24px_40px_-24px_rgb(22_48_36/0.4)]"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-[220px_1fr_auto] gap-10 px-8 py-9">
        <div className="border-r border-line pr-8">
          <p className="font-display text-2xl text-forest-900">{group.label}</p>
          <Link href={group.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brass-700 hover:text-forest-900">
            Overview <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-10">
          {group.columns?.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">{col.heading}</p>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group block rounded-[3px] px-2 py-1.5 -mx-2 hover:bg-sand-100">
                      <span className="text-[0.9375rem] text-forest-900 group-hover:underline group-hover:underline-offset-4">{link.label}</span>
                      {link.description && <span className="mt-0.5 block text-sm text-ink-muted">{link.description}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {group.feature && (
          <Link href={group.feature.href} className="group block w-[260px]">
            <div className="aa-arch-sm relative aspect-[4/3]">
              <Image src={group.feature.image} alt="" fill sizes="260px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </div>
            <p className="font-display mt-3 text-lg text-forest-900 group-hover:underline group-hover:underline-offset-4">{group.feature.label}</p>
            {group.feature.description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{group.feature.description}</p>}
          </Link>
        )}
      </div>
    </div>
  );
}

function MobileNav({
  open,
  onClose,
  pathname,
  portalHref,
  isAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  portalHref: string;
  isAuthenticated: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div className={cn("fixed inset-0 z-[70] xl:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      <div className={cn("absolute inset-0 bg-forest-950/60 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div
        id="aa-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-sand-50 shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-line px-4">
          <span className="flex items-center gap-2.5">
            <BrandMark className="h-9" />
            <span className="font-display text-lg font-semibold text-forest-900">Al-Asar</span>
          </span>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-line text-forest-900">
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="divide-y divide-line">
            <li>
              <Link href="/" className="block py-3.5 font-display text-lg text-forest-900" aria-current={pathname === "/" ? "page" : undefined}>
                Home
              </Link>
            </li>
            {PRIMARY_NAV.map((group) =>
              group.columns ? (
                <li key={group.label}>
                  <details className="group" open={isActive(pathname, group.href)}>
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-display text-lg text-forest-900 [&::-webkit-details-marker]:hidden">
                      {group.label}
                      <ChevronDown className="h-4 w-4 text-brass-700 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="mb-3 space-y-0.5 border-l border-brass-500/50 pl-4">
                      <li>
                        <Link href={group.href} className="block py-2 text-[0.9375rem] font-medium text-forest-800">
                          {group.label} overview
                        </Link>
                      </li>
                      {group.columns.flatMap((col) => col.links).filter((l) => l.href !== group.href).map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className="block py-2 text-[0.9375rem] text-ink">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={group.label}>
                  <Link href={group.href} className="block py-3.5 font-display text-lg text-forest-900" aria-current={isActive(pathname, group.href) ? "page" : undefined}>
                    {group.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="grid gap-2 border-t border-line p-4">
          <Link href="/admissions" className="inline-flex min-h-11 items-center justify-center rounded-[3px] bg-forest-800 px-5 font-medium text-sand-50">
            Admissions
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href={portalHref} className="inline-flex min-h-11 items-center justify-center rounded-[3px] border border-forest-800 text-sm font-medium text-forest-800">
              {isAuthenticated ? "My Dashboard" : "Portal Login"}
            </Link>
            <Link href="/recruitment" className="inline-flex min-h-11 items-center justify-center rounded-[3px] border border-line text-sm font-medium text-forest-900">
              Careers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
