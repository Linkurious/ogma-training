const { rimraf } = require("rimraf");
const copy = require("recursive-copy");

rimraf("docs")
  .then(() => copy("dist", "docs"))
  .catch(function (error) {
    console.error("Publish failed: " + error);
  })
  .then(() => {
    console.log("Publish complete. Just commit docs/ and push on master.");
  });
