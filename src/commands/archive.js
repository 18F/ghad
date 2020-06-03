const moment = require("moment");
const octokit = require("../lib/client");
const delay = require("../lib/delay");
const { getRepos } = require("../lib/repos");

// https://developer.github.com/v3/#schema
const parseGitHubTimestamp = (str) => moment(str, moment.ISO_8601);

const getLatestEvent = async (repo) => {
  const eventResponse = await octokit.activity.listRepoEvents({
    owner: repo.owner.login,
    repo: repo.name,
  });
  // filter out certain events
  // https://developer.github.com/v3/activity/events/types/
  const IGNORED_EVENTS = ["ForkEvent", "StarEvent", "WatchEvent"];
  const events = eventResponse.data.filter(
    (event) => !IGNORED_EVENTS.includes(event.type)
  );
  return events[0];
};

const attrAfter = (dateStr, cutoff) => {
  const date = parseGitHubTimestamp(dateStr);
  return date.isAfter(cutoff);
};

const updatedSince = async (repo, cutoff) => {
  if (attrAfter(repo.updated_at, cutoff)) {
    return true;
  }

  if (attrAfter(repo.pushed_at, cutoff)) {
    return true;
  }

  const latestEvent = await getLatestEvent(repo);
  if (latestEvent) {
    if (attrAfter(latestEvent.created_at, cutoff)) {
      return true;
    }
  }

  return false;
};

const hasDeprecationText = (str) =>
  /\b(DEPRECATED|NO(T| LONGER) SUPPORTED)\b/i.test(str);

const shouldBeArchived = async (repo, cutoff) => {
  // always archive "DEPRECATED" repositories
  const description = repo.description || "";
  if (hasDeprecationText(description)) {
    return true;
  }

  // if anything has happened with the repository since the cutoff, skip it
  const recentlyUpdated = await updatedSince(repo, cutoff);
  return !recentlyUpdated;
};

const archiveRepo = (repo) => {
  return octokit.repos.update({
    owner: repo.owner.login,
    repo: repo.name,
    archived: true,
  });
};

const archiveIfStale = async (repo, cutoff, apply) => {
  const archive = await shouldBeArchived(repo, cutoff);
  if (archive) {
    if (apply) {
      await archiveRepo(repo);
      console.log(`Archived ${repo.html_url}`);

      // https://developer.github.com/v3/guides/best-practices-for-integrators/#dealing-with-abuse-rate-limits
      await delay(1000);
    } else {
      console.log(`Would archive ${repo.html_url}`);
    }
    return true;
  }
  return false;
};

const processRepos = async (repos, cutoff, apply) => {
  let promises = [];
  for await (const repo of repos) {
    // don't wait for this to happen
    const promise = archiveIfStale(repo, cutoff, apply);
    promises.push(promise);
  }

  // wait until all archiving has completed
  const results = await Promise.all(promises);
  const numReposConsidered = results.length;
  // https://stackoverflow.com/a/42317235/358804
  const numReposArchived = results.filter(Boolean).length;

  let msg = `Out of ${numReposConsidered} repositories considered, ${numReposArchived} `;
  if (!apply) {
    msg += "would be ";
  }
  msg += "archived.";
  console.log(msg);
};

const archiveStaleRepos = async (cutoff, opts) => {
  if (!opts.apply) {
    process.stdout.write("DRY RUN: ");
  }

  if (opts.org) {
    console.log(`Archiving stale repositories for ${opts.org}...`);
  } else {
    console.log("Archiving stale repositories...");
  }
  const repos = getRepos(opts.org);
  await processRepos(repos, cutoff, opts.apply);

  console.log("Done.");
};

module.exports = {
  getLatestEvent,
  attrAfter,
  hasDeprecationText,
  archiveStaleRepos,
};
