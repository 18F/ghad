const moment = require("moment");
const lib = require("./lib");

const ORG = process.env.ORG;
if (!ORG) {
  throw new Error("ORG environment variable missing.");
}

const CUTOFF_DAYS = parseInt(process.env.CUTOFF_DAYS || "90");
const CUTOFF = moment().subtract(CUTOFF_DAYS, "days");

lib.archiveStaleRepos(ORG, CUTOFF);
