// دوال مساعدة لعرض حقول الملف الشخصي القادمة من /auth/me مهما اختلف شكلها

export function formatSkill(skill) {
  if (!skill) return "";
  if (typeof skill === "string") return skill;
  return skill.name || skill.title || skill.label || "";
}

export function formatEducation(edu) {
  if (!edu) return { degree: "", school: "", period: "" };
  if (typeof edu === "string") return { degree: edu, school: "", period: "" };

  const degree = edu.degree || edu.qualification || edu.title || "";
  const field = edu.field || "";
  const school =
    edu.university || edu.school || edu.institution || edu.organization || "";
  const period =
    edu.year ||
    edu.period ||
    [edu.from || edu.startYear, edu.current ? "Present" : edu.to || edu.endYear]
      .filter(Boolean)
      .join(" - ") ||
    "";

  return {
    degree: [degree, field].filter(Boolean).join(", "),
    school,
    period,
  };
}

const SOCIAL_ICONS = {
  linkedin: "bi-linkedin",
  github: "bi-github",
  twitter: "bi-twitter-x",
  x: "bi-twitter-x",
  facebook: "bi-facebook",
  instagram: "bi-instagram",
  youtube: "bi-youtube",
  website: "bi-globe",
  portfolio: "bi-globe",
};

export function formatSocialLink(link) {
  if (!link) return null;

  let url = "";
  let platform = "";

  if (typeof link === "string") {
    url = link;
  } else {
    url = link.url || link.href || link.link || "";
    platform = link.platform || link.name || link.type || link.label || "";
  }

  if (!url && !platform) return null;

  if (!platform) {
    try {
      platform = new URL(url).hostname.replace("www.", "").split(".")[0];
    } catch {
      platform = "link";
    }
  }

  const key = String(platform).toLowerCase();
  const href = url && !/^https?:\/\//i.test(url) ? `https://${url}` : url;

  return {
    label: platform,
    href: href || "#",
    icon: SOCIAL_ICONS[key] || "bi-link-45deg",
  };
}
