const ANALYTICS_ID = 'G-YX080G9EW3';
const CONSENT_STORAGE_KEY = 'hackerino_cookie_consent';
const siteScriptUrl = document.currentScript?.src;

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});

function readConsentChoice() {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveConsentChoice(value) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Se lo spazio locale non è disponibile, la scelta vale per la pagina corrente.
  }
}

function loadGoogleAnalytics() {
  if (document.querySelector(`script[data-hackerino-analytics="${ANALYTICS_ID}"]`)) return;

  window.gtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  });

  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  analyticsScript.dataset.hackerinoAnalytics = ANALYTICS_ID;
  document.head.append(analyticsScript);

  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_ID);
}

function clearAnalyticsCookies() {
  const hostname = window.location.hostname;
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name.startsWith('_ga'));

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    if (hostname && hostname !== 'localhost') {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${hostname}; SameSite=Lax`;
    }
  });
}

function privacyPageUrl() {
  if (!siteScriptUrl) return 'privacy.html#cookie-analytics';
  return new URL('../privacy.html#cookie-analytics', siteScriptUrl).href;
}

function hideConsentBanner() {
  document.querySelector('#cookie-consent')?.remove();
}

function showConsentBanner() {
  hideConsentBanner();

  const banner = document.createElement('section');
  banner.id = 'cookie-consent';
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'cookie-consent-title');
  banner.setAttribute('aria-describedby', 'cookie-consent-description');
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-copy">
        <p class="cookie-banner-label">La scelta è tua</p>
        <h2 id="cookie-consent-title">Cookie per misurare il sito?</h2>
        <p id="cookie-consent-description">Google Analytics ci aiuta a capire quali contenuti sono utili. Lo attiviamo solo se accetti; rifiutando il sito funziona normalmente.</p>
        <a href="${privacyPageUrl()}">Privacy e dettagli sui cookie</a>
      </div>
      <div class="cookie-banner-actions">
        <button class="cookie-choice cookie-reject" type="button" data-cookie-reject>Rifiuta</button>
        <button class="cookie-choice cookie-accept" type="button" data-cookie-accept>Accetta</button>
      </div>
    </div>`;

  document.body.append(banner);

  banner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
    saveConsentChoice('accepted');
    loadGoogleAnalytics();
    hideConsentBanner();
  });

  banner.querySelector('[data-cookie-reject]').addEventListener('click', () => {
    const analyticsWasActive = readConsentChoice() === 'accepted';
    saveConsentChoice('rejected');
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
    clearAnalyticsCookies();

    if (analyticsWasActive) {
      window.location.reload();
      return;
    }

    hideConsentBanner();
  });
}

function addConsentSettingsLinks() {
  document.querySelectorAll('.footer-links').forEach((footerLinks) => {
    if (footerLinks.querySelector('[data-cookie-settings]')) return;

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'cookie-settings-button';
    settingsButton.dataset.cookieSettings = '';
    settingsButton.textContent = 'Gestisci cookie';
    settingsButton.addEventListener('click', showConsentBanner);
    footerLinks.append(settingsButton);
  });
}

const savedConsentChoice = readConsentChoice();
if (savedConsentChoice === 'accepted') {
  loadGoogleAnalytics();
} else if (!savedConsentChoice) {
  showConsentBanner();
}

addConsentSettingsLinks();

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      mainNav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const searchInput = document.querySelector('#guide-search');
const searchForm = document.querySelector('#hero-search');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const guideCards = [...document.querySelectorAll('[data-category]')];
const noResults = document.querySelector('#no-results');
let activeFilter = 'tutte';

function filterGuides() {
  if (!guideCards.length) return;

  const query = (searchInput?.value || '').trim().toLocaleLowerCase('it');
  let visibleCount = 0;

  guideCards.forEach((card) => {
    const categoryMatches = activeFilter === 'tutte' || card.dataset.category === activeFilter;
    const searchableText = `${card.dataset.search || ''} ${card.textContent}`.toLocaleLowerCase('it');
    const queryMatches = !query || searchableText.includes(query);
    const isVisible = categoryMatches && queryMatches;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (noResults) noResults.hidden = visibleCount !== 0;
}

searchInput?.addEventListener('input', filterGuides);
searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  filterGuides();
  document.querySelector('#notizie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    filterGuides();
  });
});
