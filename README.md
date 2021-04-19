# ghad: The GitHub Administration Tool

[![CircleCI](https://circleci.com/gh/18F/ghad.svg?style=svg)](https://circleci.com/gh/18F/ghad)

`ghad` ("gad") is a command-line tool for managing a large number of GitHub repositories. It currently allows you to:

- Archive repositories that haven't been updated in a specified number of days
- Enable [security alerts for vulnerable dependencies](https://help.github.com/en/articles/about-security-alerts-for-vulnerable-dependencies)
- Enable [automated security fixes](https://help.github.com/en/articles/configuring-automated-security-fixes)

It can be run manually, or set up to run from a continuous integration system - see [the CircleCI configuration](.circleci/config.yml).

## Setup

1. Install Node.js 10+.
1. [Create a token.](https://github.com/settings/tokens/new?description=ghad&scopes=repo,read:org)
1. Clone this repository.
1. Set your GitHub token.

   ```sh
   export GITHUB_TOKEN=...
   ```

1. View the documentation.

   ```sh
   npx ghad --help
   ```

## Example usage

1. Run the script as a dry run.

   ```sh
   npx ghad archive --org <something>
   ```

1. To actually archive repositories:

   ```sh
   npx ghad archive --org <something> --apply
   ```

The `--org` is optional. See `npx ghad archive --help` for more info.

## Automation

See [the CircleCI automation configuration](.circleci/config.yml).

**Warning: _Keep write access to this repository restricted._** The associated GitHub token is that of an Owner, so being able to run arbitrary commands in CI allows privilege escalation.

## Usage in TTS

`ghad` is run across [TTS GitHub repositories](https://handbook.18f.gov/github/#organizations) by the [**@tts-bot**](https://github.com/tts-bot). The bot is a member of the [`GSA/tts-admins`](https://github.com/orgs/GSA/teams/tts-admins/members) team. To include a repository to ghad's scope, give the `GSA/tts-admins` team `admin` access to the repository. 
