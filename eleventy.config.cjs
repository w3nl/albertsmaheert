module.exports = function(eleventyConfig) {
  // The escape room is a finished static game: copy it as-is, never run its HTML through the template engine.
  eleventyConfig.ignores.add("src/escaperoom/**");
  eleventyConfig.addPassthroughCopy("src/escaperoom");

  for (const directory of ["assets", "cdn-cgi", "wp-content", "wp-includes", "wp-json"]) {
    eleventyConfig.addPassthroughCopy(`src/${directory}`);
  }

  for (const file of ["CNAME", "favicon.ico", "manifest.json", "robots.txt"]) {
    eleventyConfig.addPassthroughCopy(`src/${file}`);
  }

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};