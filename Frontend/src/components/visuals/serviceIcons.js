import React from "react";
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Car,
  Home,
  Wind,
  Monitor,
  GraduationCap,
  Trees,
  Sliders,
  Sparkles,
} from "lucide-react";

export const SERVICE_ICONS = {
  Plumber: Wrench,
  Electrician: Zap,
  Carpenter: Hammer,
  Painter: Paintbrush,
  Mechanic: Car,
  "House Help": Home,
  "AC Repair": Wind,
  "Computer Repair": Monitor,
  Tutor: GraduationCap,
  Gardener: Trees,
  "Appliance Repair": Sliders,
  Other: Sparkles,
};

export function renderServiceIcon(serviceName, className = "h-4 w-4") {
  const IconComponent = SERVICE_ICONS[serviceName] || Sparkles;
  return React.createElement(IconComponent, { className });
}
