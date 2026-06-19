import { landingFeatures, landingSteps, aboutContent } from "../mock/landing";
import { simulateDelay } from "../mock/utils";

export async function getLandingContent() {
  await simulateDelay(100);
  return { features: landingFeatures, steps: landingSteps };
}

export async function getAboutContent() {
  await simulateDelay(100);
  return aboutContent;
}
