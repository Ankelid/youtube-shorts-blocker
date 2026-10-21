// ========================================================
// YouTube Shorts Blocker - Popup Logic v1.4
// ========================================================

const translations = {
  ru: {
    appTitle: "Shorts Blocker",
    statusActive: "Вкл",
    statusInactive: "Выкл",
    masterToggleTitle: "Блокировщик Shorts",
    masterToggleDesc: "Основной выключатель работы расширения",
    backBtn: "Назад",
    settingsTitle: "Настройки",
    featuresSection: "Функции блокировки",
    blockPlaybackTitle: "Блокировать открытие Shorts",
    blockPlaybackDesc: "Запрещает запуск и оставляет вас на прежней странице",
    hideButtonsTitle: "Скрывать Shorts",
    hideButtonsDesc: "Полностью убирает Shorts и ленты из YouTube",
    langLabel: "Язык интерфейса"
  },
  en: {
    appTitle: "Shorts Blocker",
    statusActive: "Active",
    statusInactive: "Off",
    masterToggleTitle: "Shorts Blocker",
    masterToggleDesc: "Master switch for all blocking features",
    backBtn: "Back",
    settingsTitle: "Settings",
    featuresSection: "Blocking Features",
    blockPlaybackTitle: "Block opening Shorts",
    blockPlaybackDesc: "Prevents playback and keeps you on your current page",
    hideButtonsTitle: "Hide Shorts",
    hideButtonsDesc: "Completely removes Shorts and shelves across YouTube",
    langLabel: "Interface language"
  }
};

let currentLang = 'ru';

// Элементы UI
const viewMain = document.getElementById('view-main');
const viewSettings = document.getElementById('view-settings');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnBack = document.getElementById('btn-back');

const masterToggle = document.getElementById('master-toggle');
const statusBadge = document.getElementById('status-badge');
const toggleBlockPlayback = document.getElementById('toggle-block-playback');
const toggleHideButtons = document.getElementById('toggle-hide-buttons');
const langButtons = document.querySelectorAll('.lang-choice');

/**
 * Перевод интерфейса
 */
function setLanguage(lang) {
  currentLang = lang;
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

  updateBadge(masterToggle.checked);
}

/**
 * Обновление статусного бейджа
 */
function updateBadge(isActive) {
  const dict = translations[currentLang] || translations.ru;
  if (isActive) {
    statusBadge.textContent = dict.statusActive;
    statusBadge.className = 'badge active';
  } else {
    statusBadge.textContent = dict.statusInactive;
    statusBadge.className = 'badge inactive';
  }
}

// Загрузка настроек из chrome.storage (значения по умолчанию = true)
chrome.storage.local.get({
  isExtensionActive: true,
  blockPlayback: true,
  hideButton: true,
  language: 'ru'
}, (data) => {
  masterToggle.checked = data.isExtensionActive;
  toggleBlockPlayback.checked = data.blockPlayback;
  toggleHideButtons.checked = data.hideButton;
  setLanguage(data.language);
});

// 1. Главный мастер-тумблер
masterToggle.addEventListener('change', () => {
  const active = masterToggle.checked;
  updateBadge(active);
  chrome.storage.local.set({ isExtensionActive: active });
});

// 2. Тумблер в настройках: Блокировка запуска Shorts
toggleBlockPlayback.addEventListener('change', () => {
  chrome.storage.local.set({ blockPlayback: toggleBlockPlayback.checked });
});

// 3. Тумблер в настройках: Скрытие кнопки Shorts и полок
toggleHideButtons.addEventListener('change', () => {
  chrome.storage.local.set({ hideButton: toggleHideButtons.checked });
});

// 4. Переключение языка
langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    setLanguage(lang);
    chrome.storage.local.set({ language: lang });
  });
});

// 5. Навигация
btnOpenSettings.addEventListener('click', () => {
  viewMain.classList.add('hidden');
  viewSettings.classList.remove('hidden');
});

btnBack.addEventListener('click', () => {
  viewSettings.classList.add('hidden');
  viewMain.classList.remove('hidden');
});
