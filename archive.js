const moment = require("moment");
const Octokit = require("@octokit/rest");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable missing.");
}
const octokit = Octokit({
  auth: GITHUB_TOKEN
});

const ORG = process.env.ORG;
if (!ORG) {
  throw new Error("ORG environment variable missing.");
}

const CUTOFF_DAYS = parseInt(process.env.CUTOFF_DAYS || "90");
const CUTOFF = moment().subtract(CUTOFF_DAYS, "days");

const getRepos = () => {
  const options = octokit.search.repos.endpoint.merge({
    q: `user:${ORG} archived:false`
  });
  return octokit.paginate.iterator(options);
};

// https://developer.github.com/v3/#schema
const parseGitHubTimestamp = str => moment(str, moment.ISO_8601);

const getLatestEvent = async repo => {
  const events = await octokit.activity.listRepoEvents({
    owner: repo.owner.login,
    repo: repo.name,
    per_page: 1
  });
  return events[0];
};

const shouldBeArchived = async repo => {
  // always archive "DEPRECATED" repositories
  const description = repo.description || "";
  if (/DEPRECATED/i.test(description)) {
    return true;
  }

  // if anything has happened with the repository since the CUTOFF, skip it

  const updatedAt = parseGitHubTimestamp(repo.updated_at);
  const pushedAt = parseGitHubTimestamp(repo.pushed_at);
  if (updatedAt.isAfter(CUTOFF) || pushedAt.isAfter(CUTOFF)) {
    return false;
  }

  const latestEvent = await getLatestEvent(repo);
  if (latestEvent) {
    const createdAt = parseGitHubTimestamp(latestEvent.created_at);
    if (createdAt.isAfter(CUTOFF)) {
      return false;
    }
  }

  return true;
};

const archiveRepo = repo => {
  return octokit.repos.update({
    owner: repo.owner.login,
    repo: repo.name,
    archived: true
  });
};

(async () => {
  const repoSearch = getRepos();
  for await (const response of repoSearch) {
    for (const repo of response.data) {
      const archive = await shouldBeArchived(repo);
      if (archive) {
        console.log(`Archiving ${repo.name}`);
        archiveRepo(repo);
      }
    }
  }
})();
