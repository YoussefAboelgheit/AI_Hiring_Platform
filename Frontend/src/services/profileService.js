import { candidateProfile } from "../mock/profile";
import { fetchMe, getSessionUser, updateSessionUser } from "./authService";
import { fileToBase64 } from "./storage/fileUtils";
import { getApiErrorMessage } from "./apiErrors";

function mergeProfileWithExtras(apiResponse) {
  const user = apiResponse?.user || apiResponse;

  return {
    ...candidateProfile,
    id: user._id || user.id,
    name: user.name || candidateProfile.name,
    email: user.email || candidateProfile.email,
    phone: user.phone || "",
    avatar: user.profile_image || user.avatar || null, 
    cvUrl: user.CV || null, 
    title: user.title || candidateProfile.title,
    location: user.location || candidateProfile.location,
    bio: user.bio || candidateProfile.bio,
    portfolio: user.portfolio || candidateProfile.portfolio,
  };
}

export async function getCandidateProfile() {
  try {
    const response = await fetchMe();
    return mergeProfileWithExtras(response);
  } catch (error) {
    const fallback = getSessionUser();
    if (fallback) return mergeProfileWithExtras(fallback);
    throw Object.assign(new Error(getApiErrorMessage(error)), { cause: error });
  }
}

export async function getCompleteProfileDefaults() {
  const sessionData = getSessionUser();
  const user = sessionData?.user || sessionData;

  if (user) {
    return {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.profile_image || user.avatar || null,
    };
  }

  try {
    const response = await fetchMe();
    const profile = response?.user || response;
    return {
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      avatar: profile.profile_image || profile.avatar || null,
    };
  } catch {
    return { name: "", email: "", phone: "", avatar: null };
  }
}

export async function saveCompleteProfile(data) {
  const updates = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    profileCompleted: true,
  };

  if (data.avatarFile) {
    updates.profile_image = await fileToBase64(data.avatarFile);
  } else if (data.avatar) {
    updates.profile_image = data.avatar;
  }

  if (data.resume) {
    updates.CV = data.resume;
  }

  const user = await updateSessionUser(updates);
  return { success: true, user };
}

export async function saveCandidateProfile(data) {
  const user = await updateSessionUser(data);
  return { success: true, user };
}