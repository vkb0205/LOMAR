import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '../../shared/config/routes';

export type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  icon: LucideIcon;
  sections: LegalSection[];
};

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  updatedAt,
  icon: Icon,
  sections,
}: LegalPageLayoutProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} — Hạnh Phúc Tới Nơi`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <div className="w-full bg-canvas pb-24 pt-28 text-ink md:pt-36">
      <header className="mx-auto w-full max-w-[960px] px-4 md:px-6">
        <div className="overflow-hidden rounded-bezel bg-ink p-1.5 shadow-lift ring-1 ring-ink/10">
          <div className="relative overflow-hidden rounded-bezel-inner px-6 py-12 md:px-12 md:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_100%_0%,rgba(215,139,162,0.22),transparent_60%),radial-gradient(65%_100%_at_0%_100%,rgba(124,154,90,0.18),transparent_65%)]"
            />
            <div className="relative z-10 max-w-3xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-rose-soft">
                <Icon aria-hidden strokeWidth={1.5} className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-rose-soft">{eyebrow}</p>
              <h1 className="mt-3 font-serif text-[clamp(2.25rem,6vw,4rem)] font-bold leading-tight text-canvas">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-canvas/75 md:text-base">
                {description}
              </p>
              <p className="mt-6 text-xs font-medium text-canvas/50">Cập nhật lần cuối: {updatedAt}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-10 grid w-full max-w-[960px] gap-8 px-4 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="md:sticky md:top-28 md:self-start">
          <nav aria-label={`Mục lục ${title}`} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">Mục lục</p>
            <ol className="space-y-3">
              {sections.map((section, index) => (
                <li key={section.title}>
                  <a
                    href={`#section-${index + 1}`}
                    className="text-sm font-medium leading-snug text-ink/65 transition-colors hover:text-rose-deep"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="rounded-bezel border border-ink/10 bg-white p-6 shadow-card md:p-10">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-28">
                <h2 className="font-serif text-2xl font-bold text-ink">
                  {index + 1}. {section.title}
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70 md:text-[15px]">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
            <Link
              to={ROUTES.home}
              className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-canvas transition-colors hover:bg-rose-deep"
            >
              Về trang chủ
            </Link>
            <a
              href="mailto:hello@hanhphuctoinoi.vn"
              className="rounded-full border border-ink/15 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:border-rose-deep hover:text-rose-deep"
            >
              Liên hệ
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
