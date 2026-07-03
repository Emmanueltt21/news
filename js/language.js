
const STORAGE_KEY = "devotional_language";
const DEFAULT_LANGUAGE = "EN";
const SUPPORTED_LANGUAGES = ["EN", "FR", "DE"];

const UI_COPIES = {
  EN: { loading: "Loading devotional...", errorTitle: "Unable to load devotional.", errorText: "Please try again.", retry: "Retry" },
  FR: { loading: "Chargement du dévot...", errorTitle: "Impossible de charger le dévot.", errorText: "Veuillez réessayer.", retry: "Réessayer" },
  DE: { loading: "Andacht wird geladen...", errorTitle: "Andacht konnte nicht geladen werden.", errorText: "Bitte versuchen Sie es erneut.", retry: "Erneut versuchen" },
};

function findField(devotional, baseName, language) {
  console.log(`Looking for field ${baseName} in language ${language}`);
  
  const prefixes = {
    FR: ["french_", "fr_"],
    DE: ["german_", "de_"],
    EN: [""]
  };
  
  const suffixes = ["", "_html", "_content", "_text"];
  const langPrefixes = prefixes[language] || [""];
  
  // Check if we have localized content for non-English languages
  let hasLocalizedContent = false;
  if (language !== "EN") {
    for (const prefix of langPrefixes) {
      if (devotional[`${prefix}content`] && devotional[`${prefix}content`].trim() !== "") {
        hasLocalizedContent = true;
        break;
      }
    }
  }

  // 1. Look for language-specific names first
  const langSpecificNames = [];
  langPrefixes.forEach(prefix => {
    if (prefix !== "") {
      suffixes.forEach(suffix => {
        langSpecificNames.push(`${prefix}${baseName}${suffix}`);
        langSpecificNames.push(`${prefix}${baseName.toLowerCase()}${suffix}`);
        langSpecificNames.push(`${prefix}${baseName.toUpperCase()}${suffix}`);
      });
    }
  });

  for (const name of langSpecificNames) {
    if (devotional[name] && devotional[name].trim() !== "") {
      console.log(`Found language-specific field: ${name} with value:`, devotional[name]);
      return devotional[name];
    }
  }

  // 2. If this is a non-English language and we have localized content, but no language-specific field was found,
  // we do NOT fall back to English for other sections (bible reading, confession, studies)
  // because they are already contained within the main localized content.
  const isMainField = baseName.toLowerCase() === "title" || baseName.toLowerCase() === "content" || baseName.toLowerCase() === "body";
  if (language !== "EN" && hasLocalizedContent && !isMainField) {
    console.log(`Not falling back to English for ${baseName} because localized content exists.`);
    return "";
  }

  // 3. Fallback to English/exact keys if allowed
  const fallbackNames = [];
  suffixes.forEach(suffix => {
    fallbackNames.push(`${baseName}${suffix}`);
    fallbackNames.push(`${baseName.toLowerCase()}${suffix}`);
    fallbackNames.push(`${baseName.toUpperCase()}${suffix}`);
  });
  fallbackNames.push(baseName);
  fallbackNames.push(baseName.toLowerCase());
  fallbackNames.push(baseName.toUpperCase());

  for (const name of fallbackNames) {
    if (devotional[name] && devotional[name].trim() !== "") {
      console.log(`Found fallback field: ${name} with value:`, devotional[name]);
      return devotional[name];
    }
  }
  
  // As a last resort, check for ANY field with baseName in it
  for (const key in devotional) {
    if (key.toLowerCase().includes(baseName.toLowerCase()) && devotional[key] && devotional[key].trim() !== "") {
      console.log(`Found last-resort field: ${key} with value:`, devotional[key]);
      return devotional[key];
    }
  }
  
  console.log(`No field found for ${baseName}`);
  return "";
}

export function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
  } catch (e) {
    console.error("Failed to get stored language:", e);
    return DEFAULT_LANGUAGE;
  }
}

export function setStoredLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch (e) {
    console.error("Failed to set stored language:", e);
  }
}

export function getUiCopy(language) {
  return UI_COPIES[language] || UI_COPIES[DEFAULT_LANGUAGE];
}

export function getLocalizedDevotional(devotional, language) {
  console.log("=== getLocalizedDevotional called with devotional and language:", devotional, language);
  
  const result = {
    title: findField(devotional, "title", language),
    content: findField(devotional, "content", language) || findField(devotional, "body", language),
    bibleReading: findField(devotional, "biblereading", language) || findField(devotional, "bible_reading", language),
    confession: findField(devotional, "confession", language),
    studies: findField(devotional, "studies", language),
  };
  
  console.log("=== Final localized devotional:", result);
  return result;
}

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES };
