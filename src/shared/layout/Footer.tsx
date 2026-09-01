import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import logoMainImg from '../../assets/images/Logo.png';
import { openContextualAssistant } from '../../features/chat/openAssistant';
import { FOOTER_EXPLORE_LINKS } from '../config/navigation';
import { ROUTES } from '../config/routes';
import { ArrowUpRightIcon } from '../ui/icons';
import { PillButton } from '../ui/PillButton';
import { Reveal } from '../ui/Reveal';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-ink px-4 pt-24 pb-10 text-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_0%,rgba(215,139,162,0.14),transparent_65%),radial-gradient(45%_55%_at_5%_100%,rgba(255,233,201,0.08),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <Reveal className="flex flex-col gap-6" duration={0.7}>
            <Link to={ROUTES.home} className="group flex items-center gap-3 self-start py-1">
              <img
                src={logoMainImg}
                alt="Logo Hạnh Phúc Tới Nơi · Hồ Văn Huê"
                className="h-14 w-auto object-contain transition-transform duration-700 ease-fluid group-hover:scale-105"
              />
              <div className="flex flex-col justify-center">
                <span className="font-serif text-xl font-bold leading-tight tracking-wide text-canvas">
                  Hạnh Phúc Tới Nơi
                </span>
                <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.2em] text-canvas/55">
                  Khu phố hạnh phúc · Hồ Văn Huê
                </span>
              </div>
            </Link>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-canvas/70">
              Hệ sinh thái dịch vụ cưới hỏi tại "Phố Cưới" Hồ Văn Huê — khám phá dịch vụ, lập kế
              hoạch và nhận tư vấn AI trong một hành trình.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-canvas/70">
              <li className="flex items-start gap-3">
                <MapPin strokeWidth={1.5} className="mt-0.5 h-4 w-4 shrink-0 text-rose-soft" aria-hidden />
                <span>45 Hồ Văn Huê, P.9, Phú Nhuận, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone strokeWidth={1.5} className="h-4 w-4 shrink-0 text-rose-soft" aria-hidden />
                <a
                  href="tel:+842838471928"
                  className="tabular-nums transition-colors duration-500 hover:text-rose-soft"
                >
                  (028) 3847 1928
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail strokeWidth={1.5} className="h-4 w-4 shrink-0 text-rose-soft" aria-hidden />
                <a
                  href="mailto:hello@hanhphuctoinoi.vn"
                  className="transition-colors duration-500 hover:text-rose-soft"
                >
                  hello@hanhphuctoinoi.vn
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1} duration={0.7}>
            <h4 className="mb-6 font-serif text-lg font-bold text-sage-mist">Khám phá</h4>
            <ul className="flex flex-col gap-3">
              {FOOTER_EXPLORE_LINKS.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center gap-1.5 text-sm text-canvas/70 transition-colors duration-500 hover:text-sage-mist"
                  >
                    {item.label}
                    <ArrowUpRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-500 ease-fluid group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2} duration={0.7}>
            {/* Double-bezel CTA panel */}
            <div className="rounded-bezel bg-white/5 p-1.5 ring-1 ring-white/10">
              <div className="flex flex-col rounded-bezel-inner bg-white/[0.04] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <h4 className="mb-3 font-serif text-lg font-bold text-sage-mist">Bắt đầu</h4>
                <p className="mb-6 text-sm leading-relaxed text-pretty text-canvas/70">
                  Tìm dịch vụ phù hợp, lưu tiến trình cưới, hoặc hỏi tư vấn AI ngay.
                </p>
                <div className="flex flex-col gap-3">
                  <PillButton to={ROUTES.explore} variant="rose" className="justify-center">
                    Khám phá dịch vụ
                  </PillButton>
                  <PillButton
                    variant="onDark"
                    onClick={() => openContextualAssistant()}
                    icon={<Sparkles strokeWidth={1.5} className="h-3.5 w-3.5" />}
                    className="justify-center"
                  >
                    Chat với AI
                  </PillButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Editorial watermark signature */}
        <Reveal duration={1} y={24} className="mb-10 select-none text-center" aria-hidden>
          <span className="font-serif text-[11vw] font-bold leading-[0.9] tracking-tight text-white/[0.05] md:text-[7vw]">
            Hạnh Phúc Tới Nơi
          </span>
        </Reveal>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs font-medium text-canvas/50">
            &copy; {currentYear} Hạnh Phúc Tới Nơi · Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-canvas/50">
            <a
              href="mailto:hello@hanhphuctoinoi.vn?subject=Yêu+cầu%20về%20chính%20sách%20bảo%20mật"
              className="transition-colors duration-500 hover:text-rose-soft"
            >
              Chính sách bảo mật
            </a>
            <a
              href="mailto:hello@hanhphuctoinoi.vn?subject=Yêu+cầu%20về%20điều%20khoản%20sử%20dụng"
              className="transition-colors duration-500 hover:text-rose-soft"
            >
              Điều khoản
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3 w-3 fill-current text-rose" strokeWidth={1.5} aria-hidden />
              Bé Song Hỷ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
