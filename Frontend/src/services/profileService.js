import { candidateProfile } from "../mock/profile";
import { fetchMe, getSessionUser, updateSessionUser, saveCompleteProfile as saveProfileToBackend } from "./authService";
import { getApiErrorMessage } from "./apiErrors";

function mergeProfileWithExtras(user) {
  return {
    ...candidateProfile,
    id: user.id,
    name: user.name || candidateProfile.name,
    email: user.email || candidateProfile.email,
    phone: user.phone || "",
    avatar: user.avatar, // يتم جلبه تلقائياً بواسطة normalizeUser المعدلة
    cv: user.cv || user.CV || null, // تمرير رابط الـ CV الجديد للصفحة
    title: user.title || candidateProfile.title,
    location: user.location || candidateProfile.location,
    bio: user.bio || candidateProfile.bio,
    portfolio: user.portfolio || candidateProfile.portfolio,
  };
}

export async function getCandidateProfile() {
  try {
    const user = await fetchMe();
    return mergeProfileWithExtras(user);
  } catch (error) {
    const fallback = getSessionUser();
    if (fallback) return mergeProfileWithExtras(fallback);
    throw Object.assign(new Error(getApiErrorMessage(error)), { cause: error });
  }
}

// توحيد بيانات ملف صاحب العمل (HR) القادمة من /auth/me
function mapRecruiterProfile(user) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role,
    jobTitle: user.job_title || "",
    bio: user.bio || user.about || "",
    logo: user.company_logo || user.avatar || null,
    company: {
      name: user.company_name || "",
      website: user.company_website || "",
      size: user.company_size || "",
      industry: user.industry || "",
      location: user.company_location || "",
      description: user.company_description || "",
      foundedYear: user.founded_year || null,
    },
    socialLinks: Array.isArray(user.social_links) ? user.social_links : [],
    isVerified: Boolean(user.isVerified),
  };
}

export async function getRecruiterProfile() {
  try {
    const user = await fetchMe();
    return mapRecruiterProfile(user);
  } catch (error) {
    const fallback = getSessionUser();
    if (fallback) return mapRecruiterProfile(fallback);
    throw Object.assign(new Error(getApiErrorMessage(error)), { cause: error });
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

export async function saveCandidateProfile(data) {
  try {
    const user = await updateSessionUser(data);
    return { success: true, user };
  } catch (error) {
    throw Object.assign(new Error(getApiErrorMessage(error)), { cause: error });
  }
}