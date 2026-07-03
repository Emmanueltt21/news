const CACHE_PREFIX = "devotional_";

export function getCachedDevotional(dateString) {
  try {
    sessionStorage.removeItem(`${CACHE_PREFIX}${dateString}`);
  } catch (e) {}
  return null;
}

export function setCachedDevotional(dateString, devotional) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${dateString}`, JSON.stringify(devotional));
  } catch (e) {
    console.error("Failed to set cached devotional:", e);
  }
}