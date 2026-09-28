import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/lib/site/content/images";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Eyebrow({ children, light, className }: { children: React.ReactNode; light?: boolean; className?: string }) {
  return <p className={cn("aa-eyebrow", light && "aa-eyebrow-light", className)}>{children}</p>;
}

/** Editorial section heading: brass eyebrow, serif title, optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  light,
  align = "left",
  as: Tag = "h2",
  id,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  light?: boolean;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow light={light} className={cn("mb-4", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
      <Tag
        id={id}
        className={cn(
          "font-display text-[2rem] leading-[1.15] font-medium tracking-[-0.01em] text-balance sm:text-[2.5rem]",
          light ? "text-sand-50" : "text-forest-900",
        )}
      >
        {title}
      </Tag>
      {lede && (
        <p className={cn("mt-5 text-lg leading-relaxed text-pretty", light ? "text-sand-200" : "text-ink-muted")}>{lede}</p>
      )}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", light ? "text-sand-200" : "text-ink-muted")}>
        <li>
          <Link href="/" className={cn("underline-offset-4 hover:underline", light ? "hover:text-white" : "hover:text-forest-800")}>
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className={cn("underline-offset-4 hover:underline", light ? "hover:text-white" : "hover:text-forest-800")}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={light ? "text-white" : "text-forest-900"}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Interior-page masthead: sand paper background, breadcrumb, serif title and
 * an optional arch-framed photograph. `tone="dark"` gives a forest variant.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  crumbs,
  image,
  imagePosition,
  tone = "light",
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: React.ReactNode;
  crumbs: Crumb[];
  image?: SiteImage;
  imagePosition?: string;
  tone?: "light" | "dark";
  children?: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <header className={cn("relative overflow-hidden border-b", dark ? "aa-lattice border-forest-950 bg-forest-900" : "border-line bg-sand-100")}>
      <Container className={cn("grid gap-10 py-12 sm:py-16", image && "lg:grid-cols-[1fr_380px] lg:items-end lg:gap-16")}>
        <div>
          <Breadcrumbs items={crumbs} light={dark} />
          {eyebrow && <Eyebrow light={dark} className="mt-8">{eyebrow}</Eyebrow>}
          <h1
            className={cn(
              "font-display mt-4 text-[2.4rem] leading-[1.08] font-medium tracking-[-0.015em] text-balance sm:text-[3.25rem]",
              dark ? "text-sand-50" : "text-forest-900",
            )}
          >
            {title}
          </h1>
          {lede && <p className={cn("mt-6 max-w-2xl text-lg leading-relaxed text-pretty", dark ? "text-sand-200" : "text-ink-muted")}>{lede}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {image && (
          <div className="relative hidden lg:block">
            <div className="aa-arch relative aspect-[4/5] border-4 border-sand-50 shadow-[0_24px_48px_-24px_rgb(22_48_36/0.45)]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="380px"
                className="object-cover"
                style={imagePosition ? { objectPosition: imagePosition } : undefined}
              />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

export function ArchImage({
  image,
  className,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  position,
  priority,
  variant = "full",
}: {
  image: SiteImage;
  className?: string;
  sizes?: string;
  position?: string;
  priority?: boolean;
  variant?: "full" | "soft";
}) {
  return (
    <div className={cn("relative overflow-hidden", variant === "full" ? "aa-arch" : "aa-arch-sm", className)}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" style={position ? { objectPosition: position } : undefined} />
    </div>
  );
}

/** Button-styled link. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light" | "ghost-light";
  className?: string;
}) {
  const styles = {
    primary: "bg-forest-800 text-sand-50 hover:bg-forest-900",
    secondary: "border border-forest-800 text-forest-800 hover:bg-forest-800 hover:text-sand-50",
    light: "bg-sand-50 text-forest-900 hover:bg-white",
    "ghost-light": "border border-sand-200/60 text-sand-50 hover:border-sand-50 hover:bg-white/10",
  }[variant];
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] px-5 py-2.5 text-[0.9375rem] font-medium transition-colors duration-200",
        styles,
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Numbered list for rules and procedures — keeps the source wording intact and scannable. */
export function RuleList({ items, start = 1, className }: { items: string[]; start?: number; className?: string }) {
  return (
    <ol className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
          <span className="font-display pt-0.5 text-sm text-brass-700 tabular-nums">{String(start + i).padStart(2, "0")}</span>
          <span className="leading-relaxed text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function BulletList({ items, className, columns }: { items: React.ReactNode[]; className?: string; columns?: 2 | 3 }) {
  return (
    <ul className={cn("grid gap-x-8 gap-y-3", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 leading-relaxed text-ink">
          <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-brass-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Shown where the prospectus does not supply a piece of information. Makes
 * the gap explicit instead of filling it with invented content.
 */
export function PendingInfo({ title, children, className }: { title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-4 rounded-[4px] border border-dashed border-sand-300 bg-sand-50 p-5", className)}>
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-brass-700" aria-hidden="true" />
      <div>
        <p className="font-medium text-forest-900">{title}</p>
        {children && <div className="mt-1 text-sm leading-relaxed text-ink-muted">{children}</div>}
      </div>
    </div>
  );
}

export function Callout({ tone = "forest", title, children, className }: { tone?: "forest" | "clay" | "sand"; title?: string; children: React.ReactNode; className?: string }) {
  const styles = {
    forest: "border-forest-700 bg-forest-100/60",
    clay: "border-clay-700 bg-clay-50",
    sand: "border-brass-500 bg-sand-100",
  }[tone];
  return (
    <div className={cn("border-l-[3px] p-5 sm:p-6", styles, className)}>
      {title && <p className={cn("mb-2 font-semibold", tone === "clay" ? "text-clay-700" : "text-forest-900")}>{title}</p>}
      <div className="leading-relaxed text-ink">{children}</div>
    </div>
  );
}

/** Closing band that invites the next step. */
export function CtaBand({ title, body, primary, secondary }: { title: string; body?: string; primary: { label: string; href: string }; secondary?: { label: string; href: string } }) {
  return (
    <section className="aa-lattice bg-forest-900">
      <Container className="flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-tight font-medium text-balance text-sand-50 sm:text-[2.25rem]">{title}</h2>
          {body && <p className="mt-3 text-lg text-sand-200">{body}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={primary.href} variant="light">
            {primary.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="ghost-light">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  );
}

/** In-page table of contents used on long policy/program pages. */
export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-brass-700 uppercase">On this page</p>
      <ul className="space-y-1 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink-muted transition-colors hover:border-brass-500 hover:text-forest-900">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Wraps a page section with consistent vertical rhythm. */
export function Section({ id, className, children, tone }: { id?: string; className?: string; children: React.ReactNode; tone?: "paper" | "white" | "sand" }) {
  const bg = { paper: "bg-sand-50", white: "bg-white", sand: "bg-sand-100" }[tone ?? "paper"];
  return (
    <section id={id} className={cn("scroll-mt-28 py-16 sm:py-20", bg, className)}>
      {children}
    </section>
  );
}
