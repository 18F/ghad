const Octokit = require("@octokit/rest");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable missing.");
}
module.exports = Octokit({
  auth: GITHUB_TOKEN
});
