import { fetchMe, getSessionUser, saveCompleteProfile as saveProfileToBackend } from "./authService";
import { getApiErrorMessage } from "./apiErrors";

function toList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

// توحيد بيانات المستخدم القادمة من /auth/me لكل من المرشح و الـ HR
function mapProfile(user) {
  if (!user) return null;

  return {
    id: user.id || user._id,
    role: user.role,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar: user.avatar, // يتم جلبه تلقائياً بواسطة normalizeUser
    isVerified: Boolean(user.isVerified),

    // بيانات المرشح
    title: user.job_title || user.title || "",
    bio: user.bio || "",
    about: user.about || "",
    location: user.location || user.company_location || "",
    portfolio: user.portfolio || "",
    cv: user.cv || user.CV || null,
    cvVisibility: user.cv_visibility || "public",
    skills: toList(user.skills),
    education: toList(user.education),
    attachments: toList(user.attachments),
    socialLinks: toList(user.social_links),

    // بيانات الشركة / الـ HR
    companyName: user.company_name || "",
    companyLogo: user.company_logo || "",
    companyWebsite: user.company_website || "",
    companySize: user.company_size || "",
    industry: user.industry || "",
    companyLocation: user.company_location || "",
    companyDescription: user.company_description || "",
    foundedYear: user.founded_year || null,
  };
}

// جلب الملف الشخصي من /auth/me مع الرجوع لبيانات الجلسة عند الفشل
async function loadProfile() {
  try {
    const user = await fetchMe();
    return mapProfile(user);
  } catch (error) {
    const fallback = getSessionUser();
    if (fallback) return mapProfile(fallback);
    throw Object.assign(new Error(getApiErrorMessage(error)), { cause: error });
  }
}

export async function getCandidateProfile() {
  return loadProfile();
}

export async function getRecruiterProfile() {
  return loadProfile();
}

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

function ensureUrl(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// تحديث الملف الشخصي للـ HR عبر PATCH /users/:id (بصيغة FormData)
export async function saveRecruiterProfile(userId, values) {
  try {
    if (!userId) throw new Error("No user session found");

    const formData = new FormData();

    // الحقول النصية: نرسلها فقط عند وجود قيمة لتفادي فشل الـ validation
    const textFields = {
      name: values.name,
      bio: values.bio,
      company_name: values.company_name,
      company_size: values.company_size,
      industry: values.industry,
      company_location: values.company_location,
      company_description: values.company_description,
    };
    Object.entries(textFields).forEach(([key, value]) => {
      const trimmed = (value ?? "").toString().trim();
      if (trimmed) formData.append(key, trimmed);
    });

    const website = ensureUrl(values.company_website);
    if (website) formData.append("company_website", website);

    if (values.founded_year) {
      formData.append("founded_year", String(values.founded_year));
    }

    // الروابط: مصفوفة بصيغة JSON string ليقوم الباك إند بتحليلها
    const socialLinks = (values.social_links || [])
      .map(ensureUrl)
      .filter(Boolean);
    formData.append("social_links", JSON.stringify(socialLinks));

    if (values.logoFile) {
      formData.append("company_logo", values.logoFile);
    }

    const updatedUser = await saveProfileToBackend(userId, formData);
    return { success: true, user: updatedUser };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

export async function getCompleteProfileDefaults() {
  const user = getSessionUser();

  if (user) {
    return {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || null,
      cv: user.cv || null
    };
  }

  try {
    const profile = await fetchMe();
    return {
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      avatar: profile.avatar || null,
      cv: profile.cv || null
    };
  } catch {
    return { name: "", email: "", phone: "", avatar: null, cv: null };
  }
}

// إرسال البيانات الحقيقية للباك إند بصيغة FormData
export async function saveCompleteProfile(data) {
  try {
    const current = getSessionUser();
    if (!current) throw new Error("No user session found");

    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("email", data.email || "");
    formData.append("phone", data.phone || "");
    
    if (data.avatarFile) {
      formData.append("profile_image", data.avatarFile);
    }
    
    if (data.cvFile) {
      formData.append("CV", data.cvFile);
    }

    const updatedUser = await saveProfileToBackend(current.id, formData);
    return { success: true, user: updatedUser };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}

// تجهيز مصفوفة التعليم بالشكل المطلوب من الباك إند (degree, field, university, from)
function normalizeEducationForSave(list) {
  return (list || [])
    .map((edu) => {
      const degree = (edu.degree || "").trim();
      const field = (edu.field || "").trim();
      const university = (edu.university || edu.school || "").trim();
      const from = edu.from ? Number(edu.from) : null;

      const entry = { degree, field, university, from };
      if (edu.current) {
        entry.current = true;
      } else if (edu.to) {
        entry.to = Number(edu.to);
      }
      return entry;
    })
    // الباك إند يشترط وجود هذه الحقول لكل عنصر
    .filter((e) => e.degree && e.field && e.university && e.from);
}

// تحديث الملف الشخصي للمرشح عبر PATCH /users/:id (بصيغة FormData)
export async function saveCandidateProfile(userId, values) {
  try {
    if (!userId) throw new Error("No user session found");

    const formData = new FormData();

    const textFields = {
      name: values.name,
      bio: values.bio,
      job_title: values.job_title,
      about: values.about,
    };
    Object.entries(textFields).forEach(([key, value]) => {
      const trimmed = (value ?? "").toString().trim();
      if (trimmed) formData.append(key, trimmed);
    });

    if (values.cv_visibility) {
      formData.append("cv_visibility", values.cv_visibility);
    }

    const skills = (values.skills || [])
      .map((s) => (s || "").toString().trim())
      .filter(Boolean);
    formData.append("skills", JSON.stringify(skills));

    const education = normalizeEducationForSave(values.education);
    formData.append("education", JSON.stringify(education));

    const attachments = (values.attachments || []).map(ensureUrl).filter(Boolean);
    formData.append("attachments", JSON.stringify(attachments));

    if (values.avatarFile) {
      formData.append("profile_image", values.avatarFile);
    }
    if (values.cvFile) {
      formData.append("CV", values.cvFile);
    }

    const updatedUser = await saveProfileToBackend(userId, formData);
    return { success: true, user: updatedUser };
  } catch (error) {
    const message = getApiErrorMessage(error);
    throw Object.assign(new Error(message), { cause: error });
  }
}
