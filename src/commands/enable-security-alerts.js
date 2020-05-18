const { getRepos, processRepos } = require("../lib/repos");
const delay = require("../lib/delay");
const octokit = require("../lib/client");

const enableSecurityAlertsForRepo = (repository) => {
  const repo = repository.name;
  const owner = repository.owner.login;

  return octokit.repos
    .enableVulnerabilityAlerts({
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
      throw error;
    });
};

const enableSecurityAlerts = async (opts) => {
  if (!opts.apply) {
    process.stdout.write("DRY RUN: ");
  }
  process.stdout.write("Enabling security alerts");
  if (opts.org) {
    process.stdout.write(` for ${opts.org}`);
  }
  console.log(
    `... Note that repositories will be listed even if they have alerts enabled already.`
  );

  try {
    const repos = getRepos(opts.org);
    await processRepos(repos, enableSecurityAlertsForRepo, opts.apply);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = {
  enableSecurityAlertsForRepo,
  enableSecurityAlerts,
};
