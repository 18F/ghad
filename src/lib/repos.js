const octokit = require("./client");
const delay = require("./delay");

const getOrgRepos = (org) => {
  const options = octokit.search.repos.endpoint.merge({
    q: `user:${org} archived:false fork:true`,
  });
  return octokit.paginate.iterator(options);
};

const getUserRepos = () => {
  const options = octokit.repos.list.endpoint.DEFAULTS;
  return octokit.paginate.iterator(options);
};

// generator function
async function* reposFromResponses(responses) {
  for await (const response of responses) {
    for (const repo of response.data) {
      if (repo.archived) {
        continue;
      }

      yield repo;
    }
  }
}

// org is optional
const getRepos = (org) => {
  let responses;
  if (org) {
    responses = getOrgRepos(org);
  } else {
    responses = getUserRepos();
  }
  return reposFromResponses(responses);
};

const processRepos = async (repositories, fn, apply) => {
  const results = [];

  for await (const repository of repositories) {
    if (apply) {
      if (results.length > 0) {
        // not the first request

        // https://developer.github.com/v3/guides/best-practices-for-integrators/#dealing-with-abuse-rate-limits
        await delay(1000);
      }

      const result = await fn(repository);
      results.push(result);
    } else {
      console.log(`Would enable for ${repository.html_url}`);
    }
  }

  return results;
};

module.exports = { getRepos, processRepos };
