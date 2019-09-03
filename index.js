const moment = require("moment");
const { archiveStaleRepos } = require("./src/commands/archive");
const {
  enableSecurityAlerts
} = require("./src/commands/enable-security-alerts-for-org");

require("yargs")
  .scriptName("ghad")
  .usage("$0 <cmd> [options]")
  .option("apply", {
    type: "boolean",
    describe: "Perform the action; without this, will only be a dry run"
  })
  .command(
    "archive",
    "Archives inactive repositories.",
    yargs => {
      yargs.options({
        cutoff: {
          type: "number",
          default: 90,
          describe:
            "Number of days a repository has been inactive to be archived"
        },
        org: {
          describe: "A GitHub user/organization to restrict the archiving to"
        }
      });
    },
    argv => {
      const cutoff = moment().subtract(argv.cutoff, "days");
      const opts = {
        apply: argv.apply,
        org: argv.org
      };
      archiveStaleRepos(cutoff, opts);
    }
  )
  .command(
    "enable-security-alerts <org>",
    "Enables security alerts.",
    yargs => {
      yargs.positional("org", {
        describe:
          "Enable the alerts for repositories in this GitHub user/organization"
      });
    },
    argv => {
      enableSecurityAlerts(argv.org, argv.apply);
    }
  )
  .strict()
  .help().argv;
