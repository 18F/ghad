# ghad: The GitHub Administration Tool

[![CircleCI](https://circleci.com/gh/18F/ghad.svg?style=svg)](https://circleci.com/gh/18F/ghad)

1. Install Node.js 10+.
1. [Create a token.](https://github.com/settings/tokens/new?description=archive%20script&scopes=repo)
1. Clone this Gist.
1. From this directory, install the dependencies.

   ```sh
   npm install
   ```

1. Run the script as a dry run.

   ```sh
   GITHUB_TOKEN=... node index.js --org <something>
   ```

1. To actually archive repositories:

   ```sh
   GITHUB_TOKEN=... FOR_REAL=1 node index.js --org <something>
   ```

The `--org` is optional. See `node index.js --help` for more info.

## Warning

***Keep write access to this repository restricted.*** The associated GitHub token is that of an Owner ([**@18f-bot**](https://github.com/18f-bot)), so being able to run arbitrary commands in CI allows privilege escalation.
