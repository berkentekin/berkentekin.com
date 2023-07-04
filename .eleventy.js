module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets/*");

    eleventyConfig.addShortcode(
        "headers",
        (title, subtitle) => 
            `<h1>${title}</h1>
             <p>${subtitle}</p>`
    );

    return {
        dir: {
            input: "src",
            data: "_data",
            includes: "_includes",
            layouts: "_layouts",
        },
    };
};