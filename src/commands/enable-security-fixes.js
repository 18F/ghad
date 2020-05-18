const { getRepos } = require("../lib/repos");
const delay = require("../lib/delay");
const octokit = require("../lib/client");

const enableSecurityFixesForRepo = (repository) => {
  const repo = repository.name;
  const owner = repository.owner.login;

  return octokit.repos
    .enableAutomatedSecurityFixes({
      owner,
      repo,
    })
    .then((response) => {
      if (response && response.status === 204) {
        console.log(`Success for ${owner}/${repo}`);
      } else {
        console.log(`Failed for ${owner}/${repo}`);
      }
      return delay(500);
    })
    .catch((error) => {
      console.error(`Failed for ${owner}/${repo}
${error.message}
${error.documentation_url}
`);
    });
};

const processRepos = async (repositories, apply) => {
  for await (const repository of repositories) {
    if (repository.archived) {
      continue;
    }

    if (apply) {
      // don' wait
      enableSecurityFixesForRepo(repository);
    } else {
      console.log(`Would enable for ${repository.html_url}`);
    }
  }
};

const enableSecurityFixes = async (opts) => {
  if (!opts.apply) {
    process.stdout.write("DRY RUN: ");
  }
  process.stdout.write("Enabling automated security fixes");
  if (opts.org) {
    process.stdout.write(` for ${opts.org}`);
  }
  console.log(
    `... Note that repositories will be listed even if they have automated security fixes enabled already.`
  );

  const repos = getRepos(opts.org);
  await processRepos(repos, opts.apply);
};

module.exports = {
  enableSecurityFixes,
};
