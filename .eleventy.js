module.exports = function(eleventyConfig) {
    // copies resources from root directory folder into _site 
    // so it can be rendered in the browser
    // thanks to https://michaelsoolee.com/add-css-11ty/
    eleventyConfig.addPassthroughCopy('src/css');
    eleventyConfig.addPassthroughCopy('src/media');
    eleventyConfig.addPassthroughCopy('src/fonts');

    // a dynamically generated, sorted list of all posts
    eleventyConfig.addCollection("blogposts", orderedBlogposts);

    // return the configuration object
    return {
        // include the passthrough options specified earlier
        passthroughFileCopy: true,
        // use the `src` directory as the root of the site
        // this avoids having to put index.md in the root of
        // the github repo
        dir: {
            input: 'src'
        }
    };
}

/**
 * Goes through the `posts` folder and grabs all of the content. The front
 * matter is then filtered for the `order` property, which we can use to sort
 * all of the posts without needing to worry about the date
 */
function orderedBlogposts(collection) {
    // https://www.11ty.dev/docs/collections/#getfilteredbyglob(-glob-)
    return collection.getFilteredByGlob("./src/posts/*.md")
        .filter(post => 'order' in post.data)
        .sort((a, b) => b.data['order'] - a.data['order'])
}
