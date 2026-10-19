const { validateProject, publishedProjects } = require('./tools/projects.cjs');

module.exports = function (eleventyConfig) {
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
