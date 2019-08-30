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

      if (argv.org) {
        lib.archiveStaleRepos(argv.org, cutoff);
      } else {
        lib.archiveAllStaleRepos(cutoff);
      }
    }
  )
  .strict()
  .help().argv;
