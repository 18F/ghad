#!/usr/bin/env node

const moment = require("moment");
const { archiveStaleRepos } = require("./src/commands/archive");
const {
  enableSecurityAlerts
} = require("./src/commands/enable-security-alerts-for-org");
const {
  enableSecurityFixes
} = require("./src/commands/enable-automated-security-fixes-for-org");

const commonOpts = argv => {
  return {
    apply: argv.apply,
    org: argv.org
  };
};

require("yargs")
  .scriptName("ghad")
  .usage("$0 <cmd> [options]")
  .options({
    apply: {
      type: "boolean",
      describe: "Perform the action; without this, will only be a dry run"
    },
    org: {
      describe: "Limit to repositories owned by this user/organization"
    }
  })
  .command(
    "archive",
    "Archives inactive repositories.",
    yargs => {
      yargs.option("cutoff", {
        type: "number",
        default: 90,
        describe: "Number of days a repository has been inactive to be archived"
      });
    },
    argv => {
      const cutoff = moment().subtract(argv.cutoff, "days");
      const opts = commonOpts(argv);
      archiveStaleRepos(cutoff, opts);
    }
  )
  .command(
    "enable-security-alerts",
    "Enables security alerts. https://help.github.com/en/articles/about-security-alerts-for-vulnerable-dependencies",
    yargs => {},
    argv => {
      const opts = commonOpts(argv);
      enableSecurityAlerts(opts);
    }
  )
  .command(
    "enable-security-fixes",
    "Enables automated security fixes. Note you'll need to enable security alerts first. https://help.github.com/en/articles/configuring-automated-security-fixes",
    yargs => {},
    argv => {
      const opts = commonOpts(argv);
      enableSecurityFixes(opts);
    }
  )
  .demandCommand()
  .strict()
  .help().argv;
