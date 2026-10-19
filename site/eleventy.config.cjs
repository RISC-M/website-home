const { validateProject, publishedProjects } = require('./tools/projects.cjs');

module.exports = function (eleventyConfig) {
  // Keep authoring in posts/ while layouts and publishing rules stay in site/.
  eleventyConfig.ignores.add('README.md');
  eleventyConfig.ignores.add('site/docs/**');
  eleventyConfig.ignores.add('site/templates/**');
  eleventyConfig.addPreprocessor('project-posts', 'md', function (data) {
    if (!this.inputPath.startsWith('./posts/')) return;
    data.layout = 'project.njk';
    data.projectPage = true;
    data.permalink = data.draft === true ? false : `/showcase/${data.slug}/index.html`;
    data.eleventyExcludeFromCollections = data.draft === true;
  });
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
  eleventyConfig.addPassthroughCopy({ 'site/public': '.', 'posts/media': 'media' });
  for (const page of ['index.html', 'about.html', 'sponsorship.html']) {
    eleventyConfig.addPassthroughCopy({ [`site/pages/${page}`]: page });
  }
  eleventyConfig.addCollection('projects', collection => {
    const projects = collection.getFilteredByGlob('posts/*.md');
    for (const project of projects) validateProject(project.data, project.inputPath);
    return publishedProjects(projects);
  });
  eleventyConfig.addFilter('displayDate', value => new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
  }).format(new Date(value)));
  eleventyConfig.addFilter('isoDate', value => new Date(value).toISOString().slice(0, 10));
  return {
    dir: { input: '.', includes: 'site/layouts', output: '_site' },
    templateFormats: ['njk', 'md'],
    markdownTemplateEngine: false,
    htmlTemplateEngine: false
  };
};
