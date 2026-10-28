// Reliable local image mappings for categories and services across CommunityConnect

export const CATEGORY_IMAGES = {
  blood: "/images/categories/cat-blood.jpg",
  homehelp: "/images/categories/cat-homehelp.jpg",
  cleaning: "/images/services/service-cleaning.jpg",
  food: "/images/categories/cat-food.jpg",
  care: "/images/categories/cat-care.jpg",
  repair: "/images/categories/cat-repair.jpg",
  electrician: "/images/services/service-electrician.jpg",
  plumbing: "/images/services/service-plumbing.jpg",
  education: "/images/categories/cat-education.jpg",
  tutoring: "/images/services/service-tutoring.jpg",
  appliances: "/images/services/service-appliances.jpg",
  community: "/images/categories/cat-community.jpg",
  hospital: "/images/blood/blood-hospital.jpg"
};

export const getCategoryImage = (categoryName) => {
  if (!categoryName) return CATEGORY_IMAGES.community;
  const normalized = categoryName.toLowerCase().replace(/[^a-z]/g, "");

  if (normalized.includes("blood") || normalized.includes("donor")) return CATEGORY_IMAGES.blood;
  if (normalized.includes("clean") || normalized.includes("maid") || normalized.includes("housekeep")) return CATEGORY_IMAGES.cleaning;
  if (normalized.includes("cook") || normalized.includes("food") || normalized.includes("meal") || normalized.includes("tiffin")) return CATEGORY_IMAGES.food;
  if (normalized.includes("care") || normalized.includes("elder") || normalized.includes("nurse")) return CATEGORY_IMAGES.care;
  if (normalized.includes("electr") || normalized.includes("wire") || normalized.includes("light")) return CATEGORY_IMAGES.electrician;
  if (normalized.includes("plumb") || normalized.includes("pipe") || normalized.includes("leak") || normalized.includes("tap")) return CATEGORY_IMAGES.plumbing;
  if (normalized.includes("repair") || normalized.includes("carpenter") || normalized.includes("mechanic")) return CATEGORY_IMAGES.repair;
  if (normalized.includes("tutor") || normalized.includes("teach") || normalized.includes("educat")) return CATEGORY_IMAGES.tutoring;
  if (normalized.includes("appliance") || normalized.includes("ac") || normalized.includes("fridge")) return CATEGORY_IMAGES.appliances;
  if (normalized.includes("home") || normalized.includes("helper")) return CATEGORY_IMAGES.homehelp;

  return CATEGORY_IMAGES.community;
};
