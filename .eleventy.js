module.exports = function (eleventyConfig) {
    // copies resources from root directory folder into _site
    // so it can be rendered in the browser
    // thanks to https://michaelsoolee.com/add-css-11ty/
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/media");
    eleventyConfig.addPassthroughCopy("src/fonts");

    // for the different content lists
    eleventyConfig.addCollection("blogposts", (collection) => {
        return orderedGlob(collection, "./src/blog/*.md");
    });
    eleventyConfig.addCollection("compositions", (collection) => {
        return orderedGlob(collection, "./src/compositions/*.md");
    });
    eleventyConfig.addCollection("transcriptions", (collection) => {
        return orderedGlob(collection, "./src/transcriptions/*.md");
    });
    // grouped by year
    eleventyConfig.addCollection("bucketed_posts", bucketedBlogposts);

    // return the configuration object
    return {
        // include the passthrough options specified earlier
        passthroughFileCopy: true,
        // use the `src` directory as the root of the site
        // this avoids having to put index.md in the root of
        // the github repo
        dir: {
            input: "src",
        },
    };
};

/**
 * Sort all of the "posts" corresponding to a glob pattern by the "order"
 * property in the metadata.
 * @param {*} collection Eleventy collection object
 * @param {string} glob wildcard pattern for selecting markdown files
 * @returns a list of post objects. The post with the highest order number is
 *  first in the list.
 */
function orderedGlob(collection, glob) {
    // https://www.11ty.dev/docs/collections/#getfilteredbyglob(-glob-)
    return collection
        .getFilteredByGlob(glob)
        .filter((post) => "order" in post.data)
        .sort((a, b) => b.data["order"] - a.data["order"]);
}

/**
 * Group collections by year for the "blog" page
 * @param {*} collection
 */
function bucketedBlogposts(collection) {
    let allPosts = collection.getFilteredByGlob("./src/blog/*.md");
    let buckets = {};
    allPosts.forEach((post) => {
        let year = post.data.year;
        buckets[year] ??= [];
        buckets[year].push(post);
    });
    Object.entries(buckets).forEach(([_, posts]) => {
        posts.sort((a, b) => {
            if (b.data.year === a.data.year) {
                if (b.data.month == a.data.month) {
                    return b.data.day - a.data.day;
                }
                return b.data.month - a.data.month;
            }
            return b.data.year - a.data.year;
        });
    });
    return Object.entries(buckets)
        .sort(([a_year, _a], [b_year, _b]) => {
            return b_year - a_year;
        })
        .map(([year, posts]) => {
            return {
                year,
                posts,
            };
        });
}
