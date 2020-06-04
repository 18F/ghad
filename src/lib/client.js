import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  if (process.env.NODE_ENV === "test") {
    console.log("GITHUB_TOKEN environment variable not set.");
  } else {
    throw new Error("GITHUB_TOKEN environment variable missing.");
  }
}

const client = new Octokit({
  auth: GITHUB_TOKEN,
  // https://developer.github.com/v3/previews/
  previews: ["dorian-preview", "london-preview"],
});

export default client;
