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
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    filterGuides();
  });
});
