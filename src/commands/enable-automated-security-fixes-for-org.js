const pReduce = require("../lib/p-reduce");
const delay = require("../lib/delay");
const octokit = require("../lib/client");

const enableSecurityFixes = (owner, apply) => {
  const options = octokit.repos.listForOrg.endpoint.merge({
    org: owner,
    type: "all"
  });

  octokit
    .paginate(options)
    .then(repositories =>
      pReduce(repositories, repository => {
        if (repository.archived) {
          return Promise.resolve();
        }
        const repo = repository.name;

        if (apply) {
          return octokit.repos
            .enableAutomatedSecurityFixes({
              owner,
              repo
            })
            .then(response => {
              if (response && response.status === 204) {
                console.log(`Success for ${owner}/${repo}`);
              } else {
                console.log(`Failed for ${owner}/${repo}`);
              }
              return delay(500);
            })
            .catch(error => {
              console.error(`Failed for ${owner}/${repo}
${error.message}
${error.documentation_url}
`);
            });
        } else {
          console.log(`Would enable for ${repository.html_url}`);
          return Promise.resolve();
        }
      })
    )
    .catch(error => {
      console.error(`Getting repositories for organization ${owner} failed.
${error.message} (${error.status})
${error.documentation_url}
`);
    });
};

module.exports = {
  enableSecurityFixes
};
