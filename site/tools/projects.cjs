const statuses = new Set(['in-progress', 'completed']);
function validDate(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function validateProject(data, source = 'Project') {
  const fail = message => { throw new Error(`${source}: ${message}`); };
  for (const key of ['title', 'blurb', 'slug']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) fail(`${key} is required`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) fail('slug must contain lowercase words separated by hyphens');
  if (!statuses.has(data.status)) fail('status must be in-progress or completed');
  if (!validDate(data.published)) fail('published must be a valid YYYY-MM-DD date');
  if (data.updated && (!validDate(data.updated) || new Date(data.updated) < new Date(data.published))) fail('updated must be on or after published');
  if (data.draft !== undefined && typeof data.draft !== 'boolean') fail('draft must be true or false');
  const checkURL = (value, hosts, label) => {
    let url;
    try { url = new URL(value); } catch { fail(`${label} must be a valid URL`); }
    if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.username || url.password) fail(`${label} must use an HTTPS ${hosts[0]} URL`);
  };
  checkURL(data.github, ['github.com', 'www.github.com'], 'github');
  if (!Array.isArray(data.contributors) || !data.contributors.length) fail('at least one contributor is required');
  for (const person of data.contributors) {
    if (typeof person.name !== 'string' || !person.name.trim()) fail('contributor name is required');
    checkURL(person.linkedin, ['www.linkedin.com', 'linkedin.com'], 'linkedin');
  }
}
function publishedProjects(projects) {
  const result = projects.filter(project => project.data.draft !== true);
  const slugs = new Set();
  for (const project of result) {
    if (slugs.has(project.data.slug)) throw new Error(`Duplicate project slug: ${project.data.slug}`);
    slugs.add(project.data.slug);
  }
  return result.sort((a, b) => new Date(b.data.published) - new Date(a.data.published) || a.data.title.localeCompare(b.data.title));
}
module.exports = { validateProject, publishedProjects };
