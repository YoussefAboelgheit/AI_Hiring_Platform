import * as geminiProvider from "./gemini.provider.js";

const PROVIDER_MAP = {
  gemini: geminiProvider,
};

export const getProvider = (name) => {
  const provider = PROVIDER_MAP[name || "gemini"];
  if (!provider) throw new Error(`Unknown AI provider: ${name}`);
  return provider;
};
