module.exports = {
  layout: 'layouts/project.njk',
  eleventyComputed: {
    permalink: data => data.draft === true ? false : `/showcase/${data.slug}/index.html`,
    eleventyExcludeFromCollections: data => data.draft === true
  }
};
