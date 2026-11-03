const coverScene = document.querySelector('#coverScene');
const reader = document.querySelector('#reader');
const openBook = document.querySelector('#openBook');
const closeBook = document.querySelector('#closeBook');
const restartBook = document.querySelector('#restartBook');
const contentsButton = document.querySelector('#contentsButton');
const contents = document.querySelector('#contents');
const chapterLabel = document.querySelector('#chapterLabel');
const prevPage = document.querySelector('#prevPage');
const nextPage = document.querySelector('#nextPage');
const progress = document.querySelector('#progress');
const spreads = [...document.querySelectorAll('.spread')];

let currentPage = 0;
let mobileSide = 0;

spreads.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.dataset.page = index;
  dot.setAttribute('aria-label', `Aller au chapitre ${index + 1}`);
  progress.append(dot);
});

function openReader() {
  coverScene.classList.add('is-opening');
  window.setTimeout(() => {
    coverScene.hidden = true;
    reader.hidden = false;
    requestAnimationFrame(() => reader.classList.add('is-visible'));
    showPage(currentPage, 0, false);
    closeBook.focus();
  }, 520);
}

function closeReader() {
  reader.classList.remove('is-visible');
  window.setTimeout(() => {
    reader.hidden = true;
    coverScene.hidden = false;
    requestAnimationFrame(() => coverScene.classList.remove('is-opening'));
    openBook.focus();
  }, 450);
}

function isMobile() {
  return window.matchMedia('(max-width: 800px)').matches;
}

function showPage(index, direction = 1, animate = true) {
  const bounded = Math.max(0, Math.min(index, spreads.length - 1));
  const changedSpread = bounded !== currentPage;

  if (changedSpread) {
    spreads[currentPage].classList.remove('is-active', 'show-right', 'turning-next', 'turning-prev');
    spreads[currentPage].setAttribute('aria-hidden', 'true');
    currentPage = bounded;
    mobileSide = 0;
  }

  const active = spreads[currentPage];
  active.classList.toggle('show-right', isMobile() && mobileSide === 1);
  active.classList.add('is-active');
  active.setAttribute('aria-hidden', 'false');
  if (animate) {
    active.classList.remove('turning-next', 'turning-prev');
    void active.offsetWidth;
    active.classList.add(direction >= 0 ? 'turning-next' : 'turning-prev');
  }

  chapterLabel.textContent = active.dataset.chapter;
  [...progress.children].forEach((dot, i) => dot.classList.toggle('is-active', i === currentPage));
  prevPage.disabled = currentPage === 0 && (!isMobile() || mobileSide === 0);
  nextPage.disabled = currentPage === spreads.length - 1 && (!isMobile() || mobileSide === 1);
  closeContents();
}

function goNext() {
  if (isMobile() && mobileSide === 0) {
    mobileSide = 1;
    showPage(currentPage, 1);
    return;
  }
  showPage(currentPage + 1, 1);
}

function goPrev() {
  if (isMobile() && mobileSide === 1) {
    mobileSide = 0;
    showPage(currentPage, -1);
    return;
  }
  const target = currentPage - 1;
  if (target >= 0) {
    showPage(target, -1);
    if (isMobile()) {
      mobileSide = 1;
      showPage(target, -1, false);
    }
  }
}

function closeContents() {
  contents.hidden = true;
  contentsButton.setAttribute('aria-expanded', 'false');
}

openBook.addEventListener('click', openReader);
closeBook.addEventListener('click', closeReader);
restartBook.addEventListener('click', () => showPage(0, -1));
nextPage.addEventListener('click', goNext);
prevPage.addEventListener('click', goPrev);

contentsButton.addEventListener('click', () => {
  const willOpen = contents.hidden;
  contents.hidden = !willOpen;
  contentsButton.setAttribute('aria-expanded', String(willOpen));
});

contents.addEventListener('click', event => {
  const button = event.target.closest('[data-page]');
  if (button) showPage(Number(button.dataset.page), Number(button.dataset.page) >= currentPage ? 1 : -1);
});

progress.addEventListener('click', event => {
  const button = event.target.closest('[data-page]');
  if (button) showPage(Number(button.dataset.page), Number(button.dataset.page) >= currentPage ? 1 : -1);
});

document.addEventListener('click', event => {
  if (!contents.hidden && !contents.contains(event.target) && !contentsButton.contains(event.target)) closeContents();
});

document.addEventListener('keydown', event => {
  if (reader.hidden) return;
  if (event.key === 'ArrowRight') goNext();
  if (event.key === 'ArrowLeft') goPrev();
  if (event.key === 'Escape') contents.hidden ? closeReader() : closeContents();
});

document.querySelectorAll('.pill-entry').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.pill-entry').forEach(item => item.classList.remove('is-selected'));
    document.querySelectorAll('.pill-detail').forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-selected');
    document.querySelector(`[data-detail="${button.dataset.pill}"]`).classList.add('is-active');
  });
});

window.addEventListener('resize', () => showPage(currentPage, 0, false));
showPage(0, 0, false);

const preview = new URLSearchParams(window.location.search);
if (preview.get('open') === '1') {
  const requestedPage = Number(preview.get('page') || 0);
  showPage(Math.max(0, Math.min(requestedPage, spreads.length - 1)), 1, false);
  openReader();
}
