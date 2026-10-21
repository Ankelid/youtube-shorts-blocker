// ========================================================
// YouTube Shorts Blocker - Content Script v1.8 (Ultra Fast & Safe)
// ========================================================

let config = {
  isExtensionActive: true,
  blockPlayback: true,
  hideButton: true
};

// Запоминаем последнюю обычную страницу
function updateLastValidPage() {
  if (!window.location.pathname.startsWith('/shorts/')) {
    try {
      sessionStorage.setItem('ysb_last_page', window.location.href);
    } catch (_) {}
  }
}
updateLastValidPage();

/**
 * Применение конфигурации
 */
function applyConfig() {
  const root = document.documentElement;

  if (config.isExtensionActive && config.hideButton) {
    root.classList.add('ysb-hide-shorts-ui');
    fastClean();
  } else {
    root.classList.remove('ysb-hide-shorts-ui');
    const hidden = document.querySelectorAll('.ysb-hidden');
    for (const el of hidden) {
      el.classList.remove('ysb-hidden');
    }
  }

  handleNavigationCheck();
}

// Загрузка настроек
chrome.storage.local.get({
  isExtensionActive: true,
  blockPlayback: true,
  hideButton: true
}, (data) => {
  config = { ...config, ...data };
  applyConfig();
});

// Синхронизация при переключении тумблеров
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    let hasChanges = false;
    for (const key of ['isExtensionActive', 'blockPlayback', 'hideButton']) {
      if (changes[key] !== undefined) {
        config[key] = changes[key].newValue;
        hasChanges = true;
      }
    }
    if (hasChanges) {
      applyConfig();
    }
  }
});

/**
 * 1. Мгновенный перехват клика по любому Shorts
 */
document.addEventListener('click', (e) => {
  if (!config.isExtensionActive || !config.blockPlayback) return;

  const targetLink = e.target.closest('a[href*="/shorts/"], a[href*="/shorts"]');
  if (targetLink) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

/**
 * 2. Проверка URL при прямой навигации
 */
function handleNavigationCheck() {
  if (!config.isExtensionActive || !config.blockPlayback) {
    updateLastValidPage();
    return;
  }

  if (window.location.pathname.startsWith('/shorts/')) {
    if (window.history.length > 1 && document.referrer && document.referrer.includes('youtube.com') && !document.referrer.includes('/shorts/')) {
      window.history.back();
    } else {
      const lastPage = sessionStorage.getItem('ysb_last_page');
      if (lastPage && !lastPage.includes('/shorts/')) {
        window.location.replace(lastPage);
      } else {
        window.location.replace('https://www.youtube.com/');
      }
    }
  } else {
    updateLastValidPage();
  }
}

/**
 * 3. Сверхбыстрая и безопасная очистка (0ms задержки)
 */
function fastClean() {
  if (!config.isExtensionActive || !config.hideButton) return;

  // А. Прямое скрытие всех полок и каруселей Shorts
  const directShelves = document.querySelectorAll(
    'ytd-reel-shelf-renderer:not(.ysb-hidden), ytd-rich-shelf-renderer[is-shorts]:not(.ysb-hidden), [is-shorts]:not(.ysb-hidden)'
  );
  for (let i = 0; i < directShelves.length; i++) {
    directShelves[i].classList.add('ysb-hidden');
    const section = directShelves[i].closest('ytd-item-section-renderer');
    if (section && !section.classList.contains('ysb-hidden')) {
      section.classList.add('ysb-hidden');
    }
  }

  // Б. Поиск новых ссылок на Shorts
  const newLinks = document.querySelectorAll('a[href*="/shorts"]:not([data-ysb])');
  if (newLinks.length > 0) {
    for (let i = 0; i < newLinks.length; i++) {
      const link = newLinks[i];
      link.setAttribute('data-ysb', '1');

      // Ищем родительскую полку карусели
      const shelf = link.closest(
        'ytd-reel-shelf-renderer, ytd-shelf-renderer, grid-shelf-renderer, ytd-rich-shelf-renderer, ytd-rich-section-renderer'
      );
      if (shelf && !shelf.classList.contains('ysb-hidden')) {
        shelf.classList.add('ysb-hidden');
        const section = shelf.closest('ytd-item-section-renderer');
        if (section && section.querySelectorAll('ytd-video-renderer').length === 0) {
          section.classList.add('ysb-hidden');
        }
        continue;
      }

      // Отдельная карточка Shorts
      const card = link.closest(
        'ytd-reel-item-renderer, yt-reel-item-view-model, yt-lockup-view-model, ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer'
      );
      if (card && !card.classList.contains('ysb-hidden')) {
        card.classList.add('ysb-hidden');
      }
    }
  }

  // В. Чипсы фильтра
  const newChips = document.querySelectorAll('yt-chip-cloud-chip-renderer:not(.ysb-hidden)');
  for (let i = 0; i < newChips.length; i++) {
    const chip = newChips[i];
    const text = chip.textContent ? chip.textContent.trim().toLowerCase() : '';
    if (text === 'shorts') {
      chip.classList.add('ysb-hidden');
    }
  }
}

// Запуск через requestAnimationFrame
let isFrameScheduled = false;
function scheduleClean() {
  if (!config.isExtensionActive || !config.hideButton || isFrameScheduled) return;

  isFrameScheduled = true;
  requestAnimationFrame(() => {
    fastClean();
    isFrameScheduled = false;
  });
}

// События навигации
window.addEventListener('yt-navigate-finish', () => {
  handleNavigationCheck();
  fastClean();
});

window.addEventListener('yt-page-data-updated', () => {
  handleNavigationCheck();
  scheduleClean();
});

window.addEventListener('popstate', () => {
  handleNavigationCheck();
  fastClean();
});

// Наблюдатель за DOM
let lastHref = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastHref) {
    lastHref = window.location.href;
    handleNavigationCheck();
  }
  scheduleClean();
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
