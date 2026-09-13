import { useId } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Check } from "lucide-react";
import { AppPhone } from "./app-phone";

// Native artwork keeps every edge transparent and crisp at any viewport size.
export function AppDownloadArt() {
  const id = useId().replaceAll(":", "");
  const categories = useTranslations("shop.categories");
  const t = useTranslations("launch");

  return (
    <div className="launch-download-art" aria-hidden="true">
      <div className="launch-download-orbit" />
      <div className="launch-download-orbit launch-download-orbit-outer" />
      <div className="launch-download-disc" />
      <div className="launch-download-art-phone">
        <AppPhone />
      </div>
      <div className="launch-find-card launch-find-audio">
        <span className="launch-find-card-label">
          {categories("electronics")}
          <ArrowUpRight />
        </span>
        <svg viewBox="0 0 160 140" fill="none" focusable="false">
          <defs>
            <linearGradient
              id={`${id}-band`}
              x1="30"
              y1="10"
              x2="125"
              y2="103"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fbf9ff" />
              <stop offset=".4" stopColor="#b99bdd" />
              <stop offset="1" stopColor="#604482" />
            </linearGradient>
            <linearGradient
              id={`${id}-ear`}
              x1="22"
              y1="67"
              x2="63"
              y2="125"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#e9d8ff" />
              <stop offset="1" stopColor="#8860ac" />
            </linearGradient>
          </defs>
          <ellipse
            cx="81"
            cy="128"
            rx="46"
            ry="5"
            fill="#342046"
            opacity=".12"
          />
          <path
            d="M34 87V66C34 6 126 6 126 66V87"
            stroke="#553569"
            strokeWidth="17"
            strokeLinecap="round"
          />
          <path
            d="M34 83V63C34 7 126 7 126 63V83"
            stroke={`url(#${id}-band)`}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M42 48C56 18 100 16 116 47"
            stroke="#f5edff"
            strokeWidth="2"
            opacity=".8"
            strokeLinecap="round"
          />
          <rect
            x="24"
            y="72"
            width="31"
            height="48"
            rx="13"
            fill={`url(#${id}-ear)`}
            transform="rotate(-8 24 72)"
          />
          <rect
            x="108"
            y="69"
            width="31"
            height="48"
            rx="13"
            fill={`url(#${id}-ear)`}
            transform="rotate(8 108 69)"
          />
          <rect
            x="44"
            y="73"
            width="12"
            height="47"
            rx="6"
            fill="#4b2d61"
            transform="rotate(-8 44 73)"
          />
          <rect
            x="105"
            y="72"
            width="12"
            height="47"
            rx="6"
            fill="#4b2d61"
            transform="rotate(8 105 72)"
          />
          <path
            d="M31 80L35 105M126 79L123 105"
            stroke="#f6eaff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".65"
          />
        </svg>
        <div className="launch-find-swatches">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="launch-find-card launch-find-style">
        <span className="launch-find-card-label">
          {categories("clothing")}
          <ArrowUpRight />
        </span>
        <svg viewBox="0 0 180 135" fill="none" focusable="false">
          <defs>
            <linearGradient
              id={`${id}-shoe`}
              x1="46"
              y1="36"
              x2="120"
              y2="119"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fffdf0" />
              <stop offset="1" stopColor="#dfd9b5" />
            </linearGradient>
          </defs>
          <ellipse
            cx="90"
            cy="119"
            rx="71"
            ry="6"
            fill="#30421c"
            opacity=".12"
          />
          <path
            d="M22 96L28 49Q30 40 39 49L50 61L66 63L74 41Q76 35 83 41L116 78L150 89Q163 93 161 104L156 112L30 111Q17 110 22 96Z"
            fill={`url(#${id}-shoe)`}
            stroke="#bdb997"
            strokeWidth="1.5"
          />
          <path
            d="M25 59L44 74L63 77L76 59L83 67L63 92L39 87L23 77Z"
            fill="#a0b57b"
          />
          <path
            d="M22 98Q56 103 82 100Q122 96 160 102L159 110Q158 116 149 116H28Q18 115 22 98Z"
            fill="#faf8ea"
            stroke="#d7d0b0"
            strokeWidth="1.5"
          />
          <path
            d="M28 111H153"
            stroke="#aca884"
            strokeWidth="2"
            strokeDasharray="3 4"
          />
          <path
            d="M77 54L90 54M84 63L99 63M91 72L107 72M100 81L117 81"
            stroke="#fffef6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M124 86L127 96M130 88L133 96M136 90L139 96"
            stroke="#b4b09a"
            strokeWidth="1.5"
          />
          <path
            d="M30 50L48 66"
            stroke="#fffef8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <div className="launch-find-swatches">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="launch-download-seal">
        <span>
          <Check size={17} />
        </span>
        <div>
          <strong>A&A Shop</strong>
          <small>{t("ctaArtNote")}</small>
        </div>
      </div>
    </div>
  );
}
