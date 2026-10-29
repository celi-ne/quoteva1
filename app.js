const seedQuotes = [
  { id: 1, text: 'الأمان الحقيقي لا يعني غياب المخاطر، بل القدرة على التعامل معها بذكاء.', author: 'مجهول', source: 'الأمن السيبراني', category: 'أمن سيبراني', likes: 642, color: '#25d5d3', liked: false },
  { id: 2, text: 'الكتب هي المفتاح الذي يفتح لك أبوابًا عديدة في الحياة.', author: 'جلال الدين الرومي', source: 'المثنوي', category: 'كتب', likes: 723, color: '#a467ed', liked: false },
  { id: 3, text: 'التكنولوجيا ليست مجرد أدوات، بل هي طريقة جديدة للتفكير والتفاعل مع العالم.', author: 'ستيف جوبز', source: 'مؤسس آبل', category: 'تقنية', likes: 856, color: '#44cde0', liked: false },
  { id: 4, text: 'أحيانًا، ما نحتاجه حقًا ليس حلًا، بل شجاعة لنبدأ من جديد.', author: 'باولو كويلو', source: 'الخيميائي', category: 'تحفيز', likes: 1200, color: '#ef9a57', liked: false },
  { id: 5, text: 'المعرفة التي لا تُشارك تنطفئ، أما الفكرة التي تصل فتصنع طريقًا جديدًا.', author: 'اقتباس Quoteva', source: 'مساحة الأفكار', category: 'تطوير الذات', likes: 488, color: '#8e73ff', liked: false },
  { id: 6, text: 'لا تبحث عن إجابات جاهزة؛ تعلّم كيف تصنع السؤال الذي يفتح لك الأفق.', author: 'كارل ساغان', source: 'عالم بلا حدود', category: 'فلسفة', likes: 391, color: '#e786ac', liked: false },
  { id: 7, text: 'الوعي الرقمي يبدأ من لحظة تتوقف فيها عن منح ثقتك لكل رابط.', author: 'مجهول', source: 'دليل العبور الآمن', category: 'أمن سيبراني', likes: 577, color: '#25d5d3', liked: false },
  { id: 8, text: 'كل خطوة صغيرة نحو نفسك هي رحلة كبيرة نحو العالم الذي تريده.', author: 'جيم رون', source: 'فن التقدم', category: 'تطوير الذات', likes: 510, color: '#8e73ff', liked: false }
];

let quotes = readStored('quoteva-quotes', seedQuotes);
let activeCategory = 'الكل';
let currentSearch = '';
let activeQuoteId = null;
let toastTimer;

const grid = document.querySelector('#quotes-grid');
const emptyState = document.querySelector('#empty-state');
const resultsLabel = document.querySelector('#results-label');
const searchInput = document.querySelector('#search-input');
const categoriesEl = document.querySelector('#categories');
const quoteModal = document.querySelector('#quote-modal');
const addModal = document.querySelector('#add-modal');
const toast = document.querySelector('#toast');
const modalTitle = document.querySelector('#modal-title');
const modalAuthor = document.querySelector('#modal-author');
const modalCategory = document.querySelector('#modal-category');
const formError = document.querySelector('#form-error');

function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) && value.length ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveQuotes() {
  localStorage.setItem('quoteva-quotes', JSON.stringify(quotes));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function getVisibleQuotes() {
  const needle = currentSearch.trim().toLocaleLowerCase('ar');
  return quotes.filter((quote) => {
    const matchesCategory = activeCategory === 'الكل' || quote.category === activeCategory;
    const haystack = `${quote.text} ${quote.author} ${quote.source} ${quote.category}`.toLocaleLowerCase('ar');
    return matchesCategory && (!needle || haystack.includes(needle));
  });
}

function renderCategories() {
  const categories = ['الكل', ...new Set(quotes.map((quote) => quote.category))];
  categoriesEl.innerHTML = categories.map((category) => `<button class="chip ${category === activeCategory ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}${category === 'الكل' ? ' ✦' : ''}</button>`).join('');
}

function renderQuotes() {
  const visible = getVisibleQuotes();
  grid.innerHTML = visible.map((quote) => `
    <article class="quote-card" data-id="${quote.id}" style="--card-color:${quote.color || '#25d5d3'}" tabindex="0" aria-label="فتح تفاصيل اقتباس ${escapeHtml(quote.author)}">
      <div class="quote-card-top"><span class="card-category">${escapeHtml(quote.category)}</span><button type="button" class="more-button" data-details="${quote.id}" aria-label="تفاصيل الاقتباس">···</button></div>
      <div class="quote-body"><span class="quote-mark">“</span><blockquote>${escapeHtml(quote.text)}</blockquote><span class="quote-author">— ${escapeHtml(quote.author)}</span><span class="quote-source">${escapeHtml(quote.source)}</span></div>
      <div class="quote-card-footer"><span class="card-actions"><button type="button" class="card-action ${quote.liked ? 'liked' : ''}" data-like="${quote.id}" aria-label="${quote.liked ? 'إلغاء الإعجاب' : 'إعجاب'}"><span class="heart">${quote.liked ? '♥' : '♡'}</span><span>${formatNumber(quote.likes)}</span></button><button type="button" class="card-action card-copy" data-copy="${quote.id}" aria-label="نسخ الاقتباس">⧉</button><button type="button" class="card-action" data-share="${quote.id}" aria-label="مشاركة الاقتباس">↗</button></span><span class="card-signal">✦</span></div>
    </article>
  `).join('');
  emptyState.hidden = visible.length > 0;
  grid.hidden = visible.length === 0;
  resultsLabel.textContent = currentSearch || activeCategory !== 'الكل' ? `${visible.length} اقتباسات تطابق اختيارك...` : 'اخترنا لك بعض الكلمات التي قد تغيّر طريقة تفكيرك...';
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { notation: value > 999 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2500);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  showToast('تم نسخ الاقتباس إلى الحافظة');
}

async function shareQuote(quote) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Quoteva', text: `«${quote.text}» — ${quote.author}` });
      showToast('شكرًا لمشاركة الكلمة الجميلة');
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  await copyText(`«${quote.text}» — ${quote.author}`);
}

function findQuote(id) {
  return quotes.find((quote) => String(quote.id) === String(id));
}

function toggleLike(id) {
  const quote = findQuote(id);
  if (!quote) return;
  quote.liked = !quote.liked;
  quote.likes += quote.liked ? 1 : -1;
  saveQuotes();
  renderQuotes();
  if (activeQuoteId === quote.id) openDetails(quote.id);
  showToast(quote.liked ? 'أضفت الاقتباس إلى إعجاباتك' : 'تمت إزالة الإعجاب');
}

function openDetails(id) {
  const quote = findQuote(id);
  if (!quote) return;
  activeQuoteId = quote.id;
  modalTitle.textContent = `«${quote.text}»`;
  modalAuthor.textContent = `— ${quote.author} · ${quote.source} · ${formatNumber(quote.likes)} إعجاب`;
  modalCategory.textContent = quote.category;
  quoteModal.hidden = false;
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  modal.hidden = true;
  if (quoteModal.hidden && addModal.hidden) document.body.classList.remove('modal-open');
}

function openAddModal() {
  addModal.hidden = false;
  formError.textContent = '';
  document.body.classList.add('modal-open');
  window.setTimeout(() => addModal.querySelector('textarea')?.focus(), 80);
}

function resetFilters() {
  currentSearch = '';
  activeCategory = 'الكل';
  searchInput.value = '';
  renderCategories();
  renderQuotes();
}

// Initial render
renderCategories();
renderQuotes();

categoriesEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderQuotes();
});

searchInput.addEventListener('input', (event) => {
  currentSearch = event.target.value;
  renderQuotes();
});

grid.addEventListener('click', (event) => {
  const like = event.target.closest('[data-like]');
  const copy = event.target.closest('[data-copy]');
  const share = event.target.closest('[data-share]');
  const details = event.target.closest('[data-details]');
  if (like) return toggleLike(like.dataset.like);
  if (copy) {
    const quote = findQuote(copy.dataset.copy);
    if (quote) return copyText(`«${quote.text}» — ${quote.author}`);
  }
  if (share) {
    const quote = findQuote(share.dataset.share);
    if (quote) return shareQuote(quote);
  }
  if (details) return openDetails(details.dataset.details);
  const card = event.target.closest('[data-id]');
  if (card) openDetails(card.dataset.id);
});

grid.addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('[data-id]')) {
    event.preventDefault();
    openDetails(event.target.closest('[data-id]').dataset.id);
  }
});

document.addEventListener('click', (event) => {
  const close = event.target.closest('[data-close-modal]');
  if (close) closeModal(close.closest('.modal-backdrop'));
  if (event.target.classList.contains('modal-backdrop')) closeModal(event.target);
  if (event.target.closest('.add-quote-trigger')) openAddModal();
  if (event.target.closest('[data-scroll-search]')) searchInput.focus();
  if (event.target.closest('[data-clear-filters]')) resetFilters();
  const navLink = event.target.closest('.nav-link');
  if (navLink) document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link === navLink));
});

document.querySelector('[data-modal-copy]').addEventListener('click', () => {
  const quote = findQuote(activeQuoteId);
  if (quote) copyText(`«${quote.text}» — ${quote.author}`);
});
document.querySelector('[data-modal-share]').addEventListener('click', () => {
  const quote = findQuote(activeQuoteId);
  if (quote) shareQuote(quote);
});

document.querySelector('.theme-toggle').addEventListener('click', () => {
  const light = document.documentElement.dataset.theme === 'light';
  document.documentElement.dataset.theme = light ? 'dark' : 'light';
  localStorage.setItem('quoteva-theme', light ? 'dark' : 'light');
  document.querySelector('.theme-icon').textContent = light ? '☾' : '☀';
  showToast(light ? 'عاد الوضع الليلي' : 'تم تفعيل الوضع النهاري');
});

const savedTheme = localStorage.getItem('quoteva-theme');
if (savedTheme === 'light') {
  document.documentElement.dataset.theme = 'light';
  document.querySelector('.theme-icon').textContent = '☀';
}

document.querySelector('#add-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const text = String(form.get('text') || '').trim();
  const author = String(form.get('author') || '').trim();
  if (text.length < 10) {
    formError.textContent = 'اكتب اقتباسًا أطول قليلًا (10 أحرف على الأقل).';
    return;
  }
  if (author.length < 2) {
    formError.textContent = 'أضف اسم القائل أو اكتب «مجهول». ';
    return;
  }
  const palette = { 'تقنية': '#44cde0', 'فلسفة': '#e786ac', 'تحفيز': '#ef9a57', 'أمن سيبراني': '#25d5d3', 'كتب': '#a467ed', 'تطوير الذات': '#8e73ff' };
  quotes.unshift({ id: Date.now(), text, author, source: 'إضافة من مجتمع Quoteva', category: String(form.get('category')), likes: 0, color: palette[String(form.get('category'))] || '#25d5d3', liked: false });
  saveQuotes();
  activeCategory = 'الكل';
  currentSearch = '';
  searchInput.value = '';
  renderCategories();
  renderQuotes();
  event.currentTarget.reset();
  closeModal(addModal);
  document.querySelector('#quotes').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('تمت إضافة اقتباسك بنجاح');
});

document.querySelector('[data-scroll-cards="prev"]').addEventListener('click', () => {
  const first = grid.querySelector('.quote-card');
  first?.focus({ preventScroll: false });
  showToast('أنت تشاهد أحدث الاقتباسات');
});
document.querySelector('[data-scroll-cards="next"]').addEventListener('click', () => {
  const last = grid.querySelector('.quote-card:last-child');
  last?.focus({ preventScroll: false });
  showToast('وصلت إلى نهاية المختارات');
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mainNav.addEventListener('click', (event) => {
  if (event.target.closest('.nav-link')) {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (event.key === 'Escape') {
    if (!quoteModal.hidden) closeModal(quoteModal);
    if (!addModal.hidden) closeModal(addModal);
    mainNav.classList.remove('open');
  }
});
