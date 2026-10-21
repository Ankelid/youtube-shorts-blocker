// ========================================================
// YouTube Shorts Blocker - Options Page Logic v1.4
// ========================================================

const translations = {
  ru: {
    appTitle: "YouTube Shorts Blocker",
    settingsTitle: "Настройки расширения",
    featuresSection: "Функции блокировки",
    blockPlaybackTitle: "Блокировать открытие Shorts",
    blockPlaybackDesc: "Запрещает запуск и оставляет вас на прежней странице",
    hideButtonsTitle: "Скрывать Shorts",
    hideButtonsDesc: "Полностью убирает Shorts и ленты из YouTube",
    langSection: "Язык интерфейса",
    langLabel: "Язык",
    langDesc: "Выберите язык интерфейса расширения",
    savedAuto: "Все настройки сохраняются автоматически."
  },
  en: {
    appTitle: "YouTube Shorts Blocker",
    settingsTitle: "Extension Settings",
    featuresSection: "Blocking Features",
    blockPlaybackTitle: "Block opening Shorts",
    blockPlaybackDesc: "Prevents playback and keeps you on your current page",
    hideButtonsTitle: "Hide Shorts",
    hideButtonsDesc: "Completely removes Shorts and shelves across YouTube",
    langSection: "Language",
    langLabel: "Language",
    langDesc: "Choose extension language",
    savedAuto: "All settings are saved automatically."
  }
};

const optBlockPlayback = document.getElementById('opt-block-playback');
const optHideButtons = document.getElementById('opt-hide-buttons');
const langButtons = document.querySelectorAll('.lang-choice');

function setLanguage(lang) {
  const dict = translations[lang] || translations.ru;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  langButtons.forEach((btn) => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Загрузка настроек
chrome.storage.local.get({
  blockPlayback: true,
  hideButton: true,
  language: 'ru'
}, (data) => {
  optBlockPlayback.checked = data.blockPlayback;
  optHideButtons.checked = data.hideButton;
  setLanguage(data.language);
});

// Слушатели
optBlockPlayback.addEventListener('change', () => {
  chrome.storage.local.set({ blockPlayback: optBlockPlayback.checked });
});

optHideButtons.addEventListener('change', () => {
  chrome.storage.local.set({ hideButton: optHideButtons.checked });
});

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    setLanguage(lang);
    chrome.storage.local.set({ language: lang });
  });
});
