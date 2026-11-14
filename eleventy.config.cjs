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

  // Split CMS text into paragraphs on blank lines.
  eleventyConfig.addFilter("paragraphs", (text) =>
    String(text || "").split(/\r?\n\s*\r?\n/).map((part) => part.trim()).filter(Boolean)
  );

  // Pages CMS stores images as "/assets/images/...". Make them relative to a page one folder deep.
  eleventyConfig.addFilter("relativeAsset", (path, prefix = "../") =>
    path ? prefix + String(path).replace(/^\/+/, "") : ""
  );

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