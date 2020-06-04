import octokit from "./client";
import delay from "./delay";
import { OctokitResponse } from "@octokit/types";

export interface Repo {
  archived: boolean;
  description: string;
  html_url: string;
  name: string;
  owner: { login: string };
  pushed_at: string;
  updated_at: string;
}

export type Repos = Iterable<Repo>;

type Responses = Iterable<OctokitResponse<Repos>>;

const getOrgRepos = (org: string) => {
  const options = octokit.search.repos.endpoint.merge({
    q: `user:${org} archived:false fork:true`,
  });
  return octokit.paginate.iterator(options);
};

const getUserRepos = () => {
  const options = octokit.repos.list.endpoint.DEFAULTS;
  return octokit.paginate.iterator(options);
};

async function* reposFromResponses(responses: Responses) {
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
export const getRepos = (org: string) => {
  let responses;
  if (org) {
    responses = getOrgRepos(org);
  } else {
    responses = getUserRepos();
  }
  return reposFromResponses(responses) as Repos;
};

export const processRepos = async (
  repositories: Repos,
  fn: (repo: Repo) => Promise<unknown>,
  apply: boolean
) => {
  const results = [];

  for await (const repository of repositories) {
    if (repository.archived) {
      continue;
    }

    if (apply) {
      if (results.length) {
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
