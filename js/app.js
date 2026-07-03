import { fetchNews, buildImageUrl } from "./api.js";
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
  renderNewsDetail,
  renderNewsList,
  showLoader,
  showError,
  showListView,
  showDetailView,
  updateSeo,
} from "./ui.js";

const refs = getRefs();

const state = {
  currentLanguage: getStoredLanguage(),
  newsList: [],
  currentNewsItem: null,
  currentPage: 0
};

function formatDisplayDate(dateString, language) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const locale = language === "FR" ? "fr-FR" : language === "DE" ? "de-DE" : "en-US";
    const options = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString(locale, options);
  } catch (e) {
    return dateString;
  }
}

function getShareTitle(localized) {
  return localized.title || "Daily Light News";
}

function handleNewsClick(item) {
  state.currentNewsItem = item;
  
  const url = new URL(window.location.href);
  url.searchParams.set("id", item.id);
  window.history.pushState({ id: item.id }, "", url);
  
  renderCurrentNewsDetail();
  showDetailView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCurrentNewsList() {
  const uiCopy = getUiCopy(state.currentLanguage);
  // Add thumbnailUrl to items for the list view
  const formattedList = state.newsList.map(item => ({
    ...item,
    thumbnailUrl: buildImageUrl(item)
  }));
  
  renderNewsList(formattedList, handleNewsClick);
  
  const urlParams = new URLSearchParams(window.location.search);
  const sharedId = urlParams.get("id");
  
  if (sharedId && !state.currentNewsItem) {
    const item = state.newsList.find(n => n.id == sharedId);
    if (item) {
      handleNewsClick(item);
      return;
    }
  }

  showListView();
  
  updateSeo({
    title: "News List",
    htmlContent: "Latest news from Your Daily Light",
    imageUrl: "",
    url: window.location.href,
  });
}

function renderCurrentNewsDetail() {
  if (!state.currentNewsItem) return;

  const localized = getLocalizedDevotional(state.currentNewsItem, state.currentLanguage);
  const uiCopy = getUiCopy(state.currentLanguage);
  const imageUrl = buildImageUrl(state.currentNewsItem);

  renderNewsDetail({
    localized,
    author: state.currentNewsItem.author || state.currentNewsItem.source || "",
    displayDate: formatDisplayDate(state.currentNewsItem.date || state.currentNewsItem.created_at, state.currentLanguage),
    imageUrl,
    language: state.currentLanguage,
    uiCopy,
  });

  updateSeo({
    title: getShareTitle(localized),
    htmlContent: localized.content,
    imageUrl,
    url: window.location.href,
  });
}

async function loadNewsList(options = {}) {
  const uiCopy = getUiCopy(state.currentLanguage);
  showLoader(uiCopy);

  try {
    const news = await fetchNews(state.currentPage);
    state.newsList = news;
    renderCurrentNewsList();
  } catch (error) {
    console.error("Error loading news:", error);
    showError(uiCopy);
  }
}

function handleLanguageChange(event) {
  const selectedLanguage = SUPPORTED_LANGUAGES.includes(event.target.value)
    ? event.target.value
    : DEFAULT_LANGUAGE;

  state.currentLanguage = selectedLanguage;
  setStoredLanguage(selectedLanguage);
  
  if (state.currentNewsItem) {
    renderCurrentNewsDetail();
  } else {
    renderCurrentNewsList();
  }
}

function initializeControls() {
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = state.currentLanguage;
    languageSelect.addEventListener("change", handleLanguageChange);
  }

  if (refs.retryButton) {
    refs.retryButton.addEventListener("click", () => {
      loadNewsList({ force: true });
    });
  }

  if (refs.backToNewsBtn) {
    refs.backToNewsBtn.addEventListener("click", () => {
      state.currentNewsItem = null;
      
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.pushState({ id: null }, "", url);
      
      showListView();
    });
  }
  
  window.addEventListener("popstate", (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get("id");
    
    if (sharedId) {
      const item = state.newsList.find(n => n.id == sharedId);
      if (item) {
        state.currentNewsItem = item;
        renderCurrentNewsDetail();
        showDetailView();
      }
    } else {
      state.currentNewsItem = null;
      showListView();
    }
  });
}

function initializeApp() {
  initializeControls();
  loadNewsList();
}

initializeApp();
