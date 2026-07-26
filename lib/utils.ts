export const unique = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

export const splitList = (value: string) =>
  unique(value.split(/[,\n]/g).map((item) => item.trim()));

export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const daysUntil = (value: string) => {
  const target = new Date(value).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / 86_400_000);
};

export const id = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const percent = (value: number) => `${Math.round(value)}%`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "MY";

export const profileCompleteness = (profile: {
  skills: string[];
  interests: string[];
  careerGoals: string[];
  causes: string[];
  strengths: string[];
  growthAreas: string[];
  experiences: unknown[];
  bio: string;
  zip: string;
  availableDays: string[];
  accommodations: string;
}) => {
  const checks = [
    profile.skills.length >= 3,
    profile.interests.length >= 2,
    profile.careerGoals.length >= 1,
    profile.causes.length >= 1,
    profile.strengths.length >= 2,
    profile.growthAreas.length >= 1,
    profile.experiences.length >= 1,
    profile.bio.trim().length >= 40,
    profile.zip.trim().length >= 5,
    profile.availableDays.length >= 1,
    profile.accommodations.trim().length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};
