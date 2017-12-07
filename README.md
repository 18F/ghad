1. Install Ruby.
1. [Create a token.](https://github.com/settings/tokens/new?description=archive%20script&scopes=repo)
1. Install the dependencies.

    ```sh
    gem install activesupport octokit
    ```

1. Run the script.

    ```sh
    ORG=... GITHUB_TOKEN=... ruby archive.rb
    ```

_Creative Commons Zero - public domain_
