
import { fetchDevotional, buildImageUrl } from "./api.js";
import { getCachedDevotional, setCachedDevotional } from "./cache.js";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLocalizedDevotional,
  getStoredLanguage,
  getUiCopy,
  setStoredLanguage,
} from "./language.js";
import {
  getRefs,
  renderDevotional,
  showLoader,
  showError,
  updateSeo,
} from "./ui.js";

const refs = getRefs();

const state = {
  currentDate: "",
  currentLanguage: getStoredLanguage(),
  devotional: null,
};

function pad(number) {
  return String(number).padStart(2, "0");
}

function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDays(date, amount) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + amount);
  return shifted;
}

function getAllowedDateRange() {
  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const minDate = shiftDays(maxDate, -5);
  return { minDate, maxDate };
}

function isDateAllowed(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const { minDate, maxDate } = getAllowedDateRange();
  const selectedDate = fromDateString(dateString);
  return selectedDate >= minDate && selectedDate <= maxDate;
}

function getInitialDate() {
  const url = new URL(window.location.href);
  const requestedDate = url.searchParams.get("date");
  if (requestedDate && isDateAllowed(requestedDate)) return requestedDate;
  return toDateString(getAllowedDateRange().maxDate);
}

function formatDisplayDate(dateString, language) {
  const date = fromDateString(dateString);
  const locale = language === "FR" ? "fr-FR" : language === "DE" ? "de-DE" : "en-US";
  const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString(locale, options);
}

function updatePageUrl(dateString) {
  const url = new URL(window.location.href);
  url.searchParams.set("date", dateString);
  history.replaceState(null, "", url);
}

function getCurrentShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("date", state.currentDate);
  return url.toString();
}

function getShareTitle(localized) {
  return localized.title || "Daily Devotional";
}

function renderCurrentDevotional() {
  console.log("=== renderCurrentDevotional called!");
  if (!state.devotional) {
    console.log("No devotional in state, returning!");
    return;
  }
  console.log("State devotional:", state.devotional);

  const localized = getLocalizedDevotional(state.devotional, state.currentLanguage);
  console.log("Localized content:", localized);

  const uiCopy = getUiCopy(state.currentLanguage);
  const imageUrl = buildImageUrl(state.devotional);
  console.log("Built image URL:", imageUrl);

  renderDevotional({
    localized,
    author: state.devotional.author,
    displayDate: formatDisplayDate(state.currentDate, state.currentLanguage),
    imageUrl,
    language: state.currentLanguage,
    uiCopy,
  });

  updateSeo({
    title: getShareTitle(localized),
    htmlContent: localized.content,
    imageUrl,
    url: getCurrentShareUrl(),
  });
  console.log("renderCurrentDevotional finished!");
}

async function loadDevotional(dateString, options = {}) {
  console.log("=== loadDevotional called with date:", dateString);
  const uiCopy = getUiCopy(state.currentLanguage);
  state.currentDate = dateString;
  updatePageUrl(dateString);
  showLoader(uiCopy);

  try {
    let devotional = !options.force ? getCachedDevotional(dateString) : null;
    console.log("Cached devotional found:", devotional ? "YES" : "NO");

    if (!devotional) {
      console.log("Fetching devotional from API for date:", dateString);
      devotional = await fetchDevotional(dateString);
      console.log("API response devotional:", devotional);
      setCachedDevotional(dateString, devotional);
    }

    state.devotional = devotional;
    window.devotionalDebug = devotional;
    console.log("Calling renderCurrentDevotional...");
    renderCurrentDevotional();
  } catch (error) {
    console.error("Error loading devotional:", error);
    console.error("Error details:", error.message);
    showError(uiCopy);
  }
}


function handleLanguageChange(event) {
  const selectedLanguage = SUPPORTED_LANGUAGES.includes(event.target.value)
    ? event.target.value
    : DEFAULT_LANGUAGE;

  state.currentLanguage = selectedLanguage;
  setStoredLanguage(selectedLanguage);
  renderCurrentDevotional();
}

function initializeControls() {
  const languageSelect = document.getElementById("language-select");
  languageSelect.value = state.currentLanguage;
  languageSelect.addEventListener("change", handleLanguageChange);

  refs.retryButton.addEventListener("click", () => {
    loadDevotional(state.currentDate, { force: true });
  });
}

function initializeApp() {
  state.currentDate = getInitialDate();
  initializeControls();
  loadDevotional(state.currentDate);
}

initializeApp();
