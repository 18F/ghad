const moment = require("moment");
const lib = require("./lib");

const CUTOFF_DAYS = parseInt(process.env.CUTOFF_DAYS || "90");
const CUTOFF = moment().subtract(CUTOFF_DAYS, "days");

lib.archiveAllStaleRepos(CUTOFF);
