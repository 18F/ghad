import { getRepos, processRepos, Repo } from "../lib/repos";
import octokit from "../lib/client";
import { CommonOpts } from "../../cli";

export const enableSecurityFixesForRepo = (repository: Repo) => {
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
    })
    .catch((error) => {
      console.error(`Failed for ${owner}/${repo}
${error.message}
${error.documentation_url}
`);
      throw error;
    });
};

export const enableSecurityFixes = async (opts: CommonOpts) => {
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

  try {
    const repos = getRepos(opts.org);
    await processRepos(repos, enableSecurityFixesForRepo, opts.apply);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
