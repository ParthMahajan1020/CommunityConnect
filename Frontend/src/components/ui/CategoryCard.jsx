import { ArrowUpRight } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";

export default function CategoryCard({
  title,
  description,
  imageSrc,
  fallbackSrc = "/images/categories/cat-community.jpg",
  badge,
  badgeColor = "bg-white/90 text-[#24342E]",
  onClick,
  className = ""
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E2E9E4] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#427A65]/40 hover:shadow-[0_18px_36px_rgba(36,52,46,0.08)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#427A65] ${className}`}
    >
      {/* Visual Image container with aspect ratio */}
      <div className="relative overflow-hidden aspect-16/10">
        <ImageWithFallback
          src={imageSrc}
          fallbackSrc={fallbackSrc}
          alt={title}
          aspectClassName="h-full w-full"
          className="transition-transform duration-500 ease-out group-hover:scale-106"
          overlay
          overlayClassName="bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          {badge ? (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-2xs ${badgeColor}`}>
              {badge}
            </span>
          ) : <span />}

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#24342E] shadow-2xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#427A65] group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-base font-bold text-[#24342E] group-hover:text-[#427A65] transition-colors">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-[#6F7D76] line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#427A65]">
          <span>Explore</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );
}
