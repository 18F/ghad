const moment = require("moment");
const octokit = require("./client");

const getOrgRepos = org => {
  const options = octokit.search.repos.endpoint.merge({
    q: `user:${org} archived:false fork:true`
  });
  return octokit.paginate.iterator(options);
};

// https://developer.github.com/v3/#schema
const parseGitHubTimestamp = str => moment(str, moment.ISO_8601);

const getLatestEvent = async repo => {
  const eventResponse = await octokit.activity.listRepoEvents({
    owner: repo.owner.login,
    repo: repo.name
  });
  // filter out certain events
  // https://developer.github.com/v3/activity/events/types/
  const IGNORED_EVENTS = ["ForkEvent", "StarEvent", "WatchEvent"];
  const events = eventResponse.data.filter(
    event => !IGNORED_EVENTS.includes(event.type)
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

const shouldBeArchived = async (repo, cutoff) => {
  // always archive "DEPRECATED" (repo, cutoff)sitories
  const description = repo.description || "";
  if (/DEPRECATED/i.test(description)) {
    return true;
  }

  // if anything has happened with the repository since the cutoff, skip it
  const recentlyUpdated = await updatedSince(repo, cutoff);
  return !recentlyUpdated;
};

const archiveRepo = repo => {
  return octokit.repos.update({
    owner: repo.owner.login,
    repo: repo.name,
    archived: true
  });
};

const archiveIfStale = async (repo, cutoff, apply) => {
  const archive = await shouldBeArchived(repo, cutoff);
  if (archive) {
    if (apply) {
      await archiveRepo(repo);
      console.log(`Archived ${repo.html_url}`);
    } else {
      console.log(`Would archive ${repo.html_url}`);
    }
    return true;
  }
  return false;
};

const getUserRepos = () => {
  const options = octokit.repos.list.endpoint.DEFAULTS;
  return octokit.paginate.iterator(options);
};

const processRepoResponses = async (responses, cutoff, apply) => {
  let numReposArchived = 0;

  for await (const response of responses) {
    for (const repo of response.data) {
      if (repo.archived) {
        continue;
      }

      // don't wait for this to happen
      archiveIfStale(repo, cutoff, apply).then(wasArchived => {
        if (wasArchived) {
          numReposArchived += 1;
        }
      });
    }
  }

  console.log(`${numReposArchived} repositories ${apply ? '' : 'would be '}archived.`);
};

const archiveStaleRepos = async (cutoff, opts) => {
  if (!opts.apply) {
    process.stdout.write("DRY RUN: ");
  }

  let responses;
  if (opts.org) {
    console.log(`Archiving all stale repositories for ${opts.org}...`);
    responses = getOrgRepos(opts.org);
  } else {
    console.log("Archiving all stale repositories...");
    responses = getUserRepos();
  }

  await processRepoResponses(responses, cutoff, opts.apply);

  console.log("Done.");
};

module.exports = {
  archiveStaleRepos
};
