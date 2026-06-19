import { candidateProfile } from "../mock/profile";
import { fetchMe, getSessionUser, updateSessionUser } from "./authService";
import { fileToBase64 } from "./storage/fileUtils";
import { getApiErrorMessage } from "./apiErrors";

function mergeProfileWithExtras(user) {
  return {
    ...candidateProfile,
    id: user.id,
    name: user.name || candidateProfile.name,
    email: user.email || candidateProfile.email,
    phone: user.phone || "",
    avatar: user.avatar,
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

export async function getCompleteProfileDefaults() {
  const user = getSessionUser();

  if (user) {
    return {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || null,
    };
  }

  try {
    const profile = await fetchMe();
    return {
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      avatar: profile.avatar || null,
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
    updates.avatar = await fileToBase64(data.avatarFile);
  } else if (data.avatar) {
    updates.avatar = data.avatar;
  }

  if (data.resume) {
    updates.resumeName = data.resume;
  }

  const user = await updateSessionUser(updates);
  return { success: true, user };
}

export async function saveCandidateProfile(data) {
  const user = await updateSessionUser(data);
  return { success: true, user };
}
