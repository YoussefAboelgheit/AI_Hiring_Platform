import { fetchMe, getSessionUser, updateSessionUser, saveCompleteProfile as saveProfileToBackend } from "./authService";
import { getApiErrorMessage } from "./apiErrors";

// تحويل استجابة /auth/me إلى الشكل الذي تستهلكه صفحة الملف الشخصي
function mergeProfileWithExtras(user) {
  const socialLinks = Array.isArray(user.social_links) ? user.social_links : [];

  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar: user.avatar, // يتم جلبه تلقائياً بواسطة normalizeUser المعدلة
    cv: user.cv || user.CV || null, // تمرير رابط الـ CV الجديد للصفحة
    title: user.job_title || user.title || "",
    location: user.location || user.company_location || "",
    bio: user.about || user.bio || "",
    portfolio: user.portfolio || socialLinks[0] || "",
    skills: Array.isArray(user.skills) ? user.skills : [],
    experience: Array.isArray(user.experience) ? user.experience : [],
    education: Array.isArray(user.education) ? user.education : [],
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