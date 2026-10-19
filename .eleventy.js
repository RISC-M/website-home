const { validateProject, publishedProjects } = require('./tools/projects.cjs');

module.exports = function (eleventyConfig) {
  // Keep wide technical content scrollable with a keyboard, even without JS.
  eleventyConfig.amendLibrary('md', markdown => {
    for (const type of ['fence', 'code_block']) {
      const render = markdown.renderer.rules[type];
      markdown.renderer.rules[type] = (...args) => render(...args)
        .replace('<pre', '<pre tabindex="0" role="region" aria-label="Code example"');
    }
    markdown.renderer.rules.table_open = () => '<div class="project-table" tabindex="0" role="region" aria-label="Project data table"><table>\n';
    markdown.renderer.rules.table_close = () => '</table></div>\n';
  });
  for (const path of ['index.html', 'about.html', 'sponsorship.html', 'styles.css', 'scripts.js', 'showcase.js', 'showcase.css', 'board_photos', 'uploads', 'favicon.ico', 'favicon.png', 'logo.png', 'logo-black.png', 'logo-white.png', 'robots.txt', 'google458b37c87f8edf9e.html']) {
    eleventyConfig.addPassthroughCopy(path);
  }
  eleventyConfig.addCollection('projects', collection => {
    const projects = collection.getFilteredByGlob('content/projects/*.md');
    for (const project of projects) validateProject(project.data, project.inputPath);
    return publishedProjects(projects);
  });
  eleventyConfig.addFilter('displayDate', value => new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
  }).format(new Date(value)));
  eleventyConfig.addFilter('isoDate', value => new Date(value).toISOString().slice(0, 10));
  return {
    dir: { input: '.', includes: '_includes', output: '_site' },
    templateFormats: ['njk', 'md'],
    markdownTemplateEngine: false,
    htmlTemplateEngine: false
  };
};
