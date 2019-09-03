const octokit = require("./client");

const getOrgRepos = org => {
  const options = octokit.search.repos.endpoint.merge({
    q: `user:${org} archived:false fork:true`
  });
  return octokit.paginate.iterator(options);
};

const getUserRepos = () => {
  const options = octokit.repos.list.endpoint.DEFAULTS;
  return octokit.paginate.iterator(options);
};

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

module.exports = {
  getOrgRepos,
  getUserRepos,
  reposFromResponses
};
