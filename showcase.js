(() => {
  const allowed = new Set(['all', 'in-progress', 'completed']);
  const params = new URLSearchParams(window.location.search);
  let selected = allowed.has(params.get('status')) ? params.get('status') : 'all';
  let direction = params.get('sort') === 'oldest' ? 'oldest' : 'newest';

  function contextParams() {
    const context = new URLSearchParams();
    if (selected !== 'all') context.set('status', selected);
    if (direction !== 'newest') context.set('sort', direction);
    return context.toString();
  }

  // Keep the reader's collection filters when returning from a project.
  const initialContext = contextParams();
  document.querySelectorAll('[data-showcase-return]').forEach(link => {
    link.href = `/showcase/${initialContext ? `?${initialContext}` : ''}`;
  });

  const grid = document.getElementById('showcase-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('[data-project]'));
  const filters = Array.from(document.querySelectorAll('[data-status-filter]'));
  const projectLinks = Array.from(grid.querySelectorAll('[data-project-link]'));
  const sort = document.getElementById('showcase-sort');
  const count = document.getElementById('showcase-count');
  const empty = document.getElementById('showcase-empty');
  const reset = document.getElementById('showcase-reset');
  sort.value = direction;

  function update(remember = true) {
    direction = sort.value;
    const ordered = [...cards].sort((a, b) => {
      const dateDifference = a.dataset.published.localeCompare(b.dataset.published);
      return (direction === 'oldest' ? dateDifference : -dateDifference) || a.dataset.title.localeCompare(b.dataset.title);
    });
    let visible = 0;
    for (const card of ordered) {
      const shown = selected === 'all' || card.dataset.status === selected;
      card.hidden = !shown;
      grid.append(card);
      if (shown) visible++;
    }
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.statusFilter === selected)));
    count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    empty.hidden = visible !== 0;
    const context = contextParams();
    projectLinks.forEach(link => {
      const url = new URL(link.href, window.location.href);
      url.search = context;
      link.href = url.pathname + url.search;
    });
    if (remember) {
      const url = new URL(window.location.href);
      selected === 'all' ? url.searchParams.delete('status') : url.searchParams.set('status', selected);
      direction === 'newest' ? url.searchParams.delete('sort') : url.searchParams.set('sort', direction);
      window.history.replaceState(null, '', url);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.statusFilter;
    update();
  }));
  reset?.addEventListener('click', () => {
    selected = 'all';
    update();
    filters[0].focus();
  });
  sort.addEventListener('change', () => update());
  document.querySelector('.showcase-controls').hidden = cards.length === 0;
  update(false);
})();
