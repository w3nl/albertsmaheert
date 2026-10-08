module.exports = function(eleventyConfig) {
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