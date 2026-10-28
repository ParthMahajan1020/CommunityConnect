import { MapPin, Phone, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { getCategoryImage } from "../../lib/imageMap";

export default function ServiceCard({
  service,
  onRequest,
  isRequesting = false,
  className = ""
}) {
  const category = service.category || service.serviceType || "Community Help";
  const imageSrc = getCategoryImage(category);
  const providerName = service.organizationName || service.userId?.name || "Community Helper";
  const location = service.location || service.userId?.location || "Pune Area";
  const pricing = service.pricing;
  const pricingType = service.pricingType || "Hourly";
  const isAvailable = service.availability !== false;
  const isProfessional = Boolean(service.isProfessional || service.organizationName);

  return (
    <div className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E2E9E4] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#4B78A8]/40 hover:shadow-[0_16px_32px_rgba(36,52,46,0.06)] ${className}`}>
      {/* Top Image Banner */}
      <div className="relative overflow-hidden aspect-16/9">
        <ImageWithFallback
          src={imageSrc}
          alt={service.title || category}
          aspectClassName="h-full w-full"
          className="transition-transform duration-500 ease-out group-hover:scale-105"
          overlay
          overlayClassName="bg-gradient-to-t from-black/60 via-black/10 to-transparent"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-[#24342E] shadow-2xs">
            {category}
          </span>

          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-md shadow-2xs ${
            isAvailable ? "bg-emerald-500/90 text-white" : "bg-gray-500/90 text-white"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {isAvailable ? "Available" : "Busy"}
          </span>
        </div>

        {/* Pricing tag over image */}
        <div className="absolute bottom-3 left-3 z-10 text-white">
          <p className="text-xs font-medium text-white/80">Fee</p>
          <p className="text-sm font-bold text-white drop-shadow-xs">
            {pricing > 0 ? `₹${pricing} / ${pricingType}` : "Free / Voluntary Community Help"}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Provider / Organization row */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4B78A8]">
              {isProfessional && <ShieldCheck className="h-3.5 w-3.5 text-[#4B78A8]" />}
              {providerName}
            </span>

            {isProfessional && (
              <span className="rounded-md bg-[#EAF1FA] px-1.5 py-0.5 text-[9px] font-bold text-[#4B78A8]">
                Verified Partner
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base font-bold text-[#24342E] group-hover:text-[#4B78A8] transition-colors line-clamp-1">
            {service.title || `${category} Service`}
          </h3>

          <p className="mt-1 text-xs text-[#6F7D76] line-clamp-2 leading-relaxed">
            {service.description || "Trusted local service offering available to help neighbors in the community."}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8C9892]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8C9892]" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3.5 border-t border-[#EEF2EF] flex items-center justify-between">
          {service.contact ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#6F7D76]">
              <Phone className="h-3 w-3" />
              Verified Contact
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Direct Request
            </span>
          )}

          <button
            type="button"
            onClick={() => onRequest?.(service)}
            disabled={!isAvailable || isRequesting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4B78A8] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#3D648E] active:scale-98 disabled:opacity-50"
          >
            <span>Request Help</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
