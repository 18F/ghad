# ghad: The GitHub Administration Tool

[![CircleCI](https://circleci.com/gh/18F/ghad.svg?style=svg)](https://circleci.com/gh/18F/ghad)

1. Install Node.js 10+.
1. [Create a token.](https://github.com/settings/tokens/new?description=archive%20script&scopes=repo)
1. Clone this Gist.
1. From this directory, install the dependencies.

   ```sh
   npm install
   ```

1. Run the script as a dry run. Note that the `ORG` can actually be a user.

   ```sh
   ORG=... GITHUB_TOKEN=... node archive.js
   ```

1. To actually archive repositories:

   ```sh
   ORG=... GITHUB_TOKEN=... FOR_REAL=1 node archive.js
   ```

The `archive-all.js` script can be used to archive all old repositories your user has write access to across organizations.

## Warning

***Keep write access to this repository restricted.*** The associated GitHub token is that of an Owner ([**@18f-bot**](https://github.com/18f-bot)), so being able to run arbitrary commands in CI allows privilege escalation.
