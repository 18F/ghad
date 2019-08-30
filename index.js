const moment = require("moment");
const lib = require("./lib");

require("yargs")
  .scriptName("ghad")
  .usage("$0 <cmd> [options]")
  .command(
    "archive",
    "Archives inactive repositories.",
    yargs => {
      yargs.options({
        apply: {
          type: "boolean",
          describe:
            "Archive the repositories; without this, will only be a dry run"
        },
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

      if (!argv.apply) {
        process.stdout.write("DRY RUN: ");
      }

      if (argv.org) {
        console.log(`Archiving all stale repositories for ${argv.org}.`);
        lib.archiveStaleRepos(argv.org, cutoff, argv.apply);
      } else {
        console.log("Archiving all stale repositories.");
        lib.archiveAllStaleRepos(cutoff, argv.apply);
      }
    }
  )
  .strict()
  .help().argv;
