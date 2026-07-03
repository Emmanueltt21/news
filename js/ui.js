
const refs = {
  loader: document.getElementById("loader"),
  loaderText: document.querySelector(".loader-text"),
  errorState: document.getElementById("error-state"),
  errorTitle: document.querySelector("#error-state h2"),
  errorText: document.querySelector("#error-state p"),
  retryButton: document.getElementById("retry-button"),
  content: document.getElementById("devotional-content"),
  title: document.getElementById("devotional-title"),
  author: document.getElementById("devotional-author"),
  date: document.getElementById("devotional-date"),
  image: document.getElementById("devotional-image"),
  bibleReading: document.getElementById("bible-reading"),
  body: document.getElementById("devotional-body"),
  confession: document.getElementById("confession-content"),
  studies: document.getElementById("studies-content"),
};

function sanitizeHtml(html) {
  console.log("sanitizeHtml called with html:", html);
  if (!html) return "";
  if (!window.DOMPurify) {
    console.log("DOMPurify not available, returning raw html");
    return html;
  }
  const sanitized = window.DOMPurify.sanitize(html, {
    ADD_ATTR: ["style", "class", "id"],
    ALLOW_DATA_ATTR: true,
  });
  console.log("sanitizeHtml result:", sanitized);
  return sanitized;
}

function renderSection(element, htmlContent) {
  if (!element) return;
  const sanitized = sanitizeHtml(htmlContent);
  element.innerHTML = sanitized;
  
  const sectionEl = element.closest(".section");
  if (sectionEl) {
    if (sanitized.trim() === "") {
      sectionEl.classList.add("d-none");
    } else {
      sectionEl.classList.remove("d-none");
    }
  }
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function getRefs() {
  return refs;
}

export function showLoader(copy) {
  refs.loader.classList.remove("d-none");
  refs.errorState.classList.add("d-none");
  refs.content.classList.add("d-none");
  refs.loaderText.textContent = copy.loading;
}

export function showError(copy) {
  refs.loader.classList.add("d-none");
  refs.content.classList.add("d-none");
  refs.errorState.classList.remove("d-none");
  refs.errorTitle.textContent = copy.errorTitle;
  refs.errorText.textContent = copy.errorText;
  refs.retryButton.textContent = copy.retry;
}

export function renderDevotional({ localized, author, displayDate, imageUrl, language, uiCopy }) {
  console.log("=== renderDevotional called!");
  console.log("  All refs:", refs);
  
  // Title
  refs.title.textContent = localized.title;
  console.log("  Set title to:", localized.title);
  
  // Author
  refs.author.textContent = author;
  console.log("  Set author to:", author);
  
  // Date
  refs.date.textContent = displayDate;
  console.log("  Set date to:", displayDate);

  // Image
  refs.image.onload = () => refs.image.classList.add("is-loaded");
  refs.image.onerror = () => {
    refs.image.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f7fb;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e0e7ef;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1200' height='675'/%3E%3C/svg%3E";
    refs.image.classList.add("is-loaded");
  };
  refs.image.src = imageUrl;
  refs.image.alt = localized.title;
  console.log("  Set image URL to:", imageUrl);

  // Bible Reading
  console.log("  --- BIBLE READING ---");
  console.log("  localized.bibleReading:", localized.bibleReading);
  renderSection(refs.bibleReading, localized.bibleReading);
  
  // CONTENT
  console.log("  --- CONTENT ---");
  console.log("  localized.content:", localized.content);
  renderSection(refs.body, localized.content);
  
  // Confession
  console.log("  --- CONFESSION ---");
  console.log("  localized.confession:", localized.confession);
  renderSection(refs.confession, localized.confession);
  
  // Studies
  console.log("  --- STUDIES ---");
  console.log("  localized.studies:", localized.studies);
  renderSection(refs.studies, localized.studies);

  // Show the content
  refs.loader.classList.add("d-none");
  refs.errorState.classList.add("d-none");
  refs.content.classList.remove("d-none");
  refs.content.classList.add("is-visible");
  refs.content.style.opacity = "1";
  refs.content.style.transform = "translateY(0)";

  document.documentElement.lang = language.toLowerCase();
  
  console.log("=== renderDevotional complete!");
}

export function updateSeo({ title, htmlContent, imageUrl, url }) {
  const description = stripHtml(htmlContent).slice(0, 160) || "Daily Devotional";
  document.title = `${title} | Daily Devotional`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", description);
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute("content", imageUrl);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", url);
}
