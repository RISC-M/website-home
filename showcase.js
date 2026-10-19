(() => {
  const grid = document.getElementById('showcase-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('[data-project]'));
  const filters = Array.from(document.querySelectorAll('[data-status-filter]'));
  const sort = document.getElementById('showcase-sort');
  const count = document.getElementById('showcase-count');
  const empty = document.getElementById('showcase-empty');
  const allowed = new Set(['all', 'in-progress', 'completed']);
  const params = new URLSearchParams(window.location.search);
  let selected = allowed.has(params.get('status')) ? params.get('status') : 'all';
  sort.value = params.get('sort') === 'oldest' ? 'oldest' : 'newest';

  function update(remember = true) {
    const ordered = [...cards].sort((a, b) => {
      const dateDifference = a.dataset.published.localeCompare(b.dataset.published);
      return (sort.value === 'oldest' ? dateDifference : -dateDifference) || a.dataset.title.localeCompare(b.dataset.title);
    });
    let visible = 0;
    for (const card of ordered) {
      const shown = selected === 'all' || card.dataset.status === selected;
      card.hidden = !shown;
      card.classList.remove('fade-in-card');
      grid.append(card);
      if (shown) {
        card.style.animationDelay = `${Math.min(visible * 55, 275)}ms`;
        visible++;
      }
    }
    // Restart the existing card fade after a filter or sort change.
    void grid.offsetWidth;
    for (const card of ordered) if (!card.hidden) card.classList.add('fade-in-card');
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.statusFilter === selected)));
    count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
    empty.hidden = visible !== 0;
    if (remember) {
      const url = new URL(window.location.href);
      selected === 'all' ? url.searchParams.delete('status') : url.searchParams.set('status', selected);
      sort.value === 'newest' ? url.searchParams.delete('sort') : url.searchParams.set('sort', sort.value);
      window.history.replaceState(null, '', url);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.statusFilter;
    update();
  }));
  sort.addEventListener('change', () => update());
  document.querySelector('.showcase-controls').hidden = false;
  update(false);
})();
