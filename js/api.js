
const API_BASE_URL = "https://app.yourdailylight.org";
const API_DEVOTIONAL_ENDPOINT = "https://app.yourdailylight.org/dailylight/devotionals";
const API_THUMBNAIL_BASE = "https://app.yourdailylight.org/dailylight/uploads/thumbnails/";

export function buildImageUrl(devotional) {
  const imageFilename = devotional.thumbnail || devotional.imageUrl;
  
  if (!imageFilename) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f7fb;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e0e7ef;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1200' height='675'/%3E%3C/svg%3E";
  }
  
  if (imageFilename.startsWith("data:image") || imageFilename.startsWith("http")) {
    return imageFilename;
  }

  return `${API_THUMBNAIL_BASE}${imageFilename}`;
}

export async function fetchNews(page = 0) {
  console.log("fetchNews called for page:", page);
  
  try {
    console.log("Trying real API via proxy for page:", page);
    const response = await fetch("proxy.php?action=fetch_newsm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          email: "null",
          version: "v2",
          page: page.toString(),
          media_type: "news"
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Real API response:", result);
      if (result && (result.status === "success" || result.status === "ok")) {
        return result.news || [];
      }
    }
  } catch (e) {
    console.log("Real API failed:", e);
  }

  return [];
}
