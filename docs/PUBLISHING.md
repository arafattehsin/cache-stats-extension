# Publishing Cache Stats

The repository supports two distribution paths from the same source:

- Direct extension install from the repository root
- GitHub Copilot plugin install from the `extensions/cache-stats` package

## 1. Validate the private repository

```shell
npm ci
npm run check
copilot plugin install .
copilot plugin list
```

Reinstall after changes because Copilot caches installed plugin content.

## 2. Prepare a public release

1. Review the full Git history for credentials, private session data, and local
   paths that should not be published.
2. Confirm that `assets/preview.png` remains anonymized and illustrative.
3. Keep version `1.0.0` synchronized in `package.json`,
   `extensions/cache-stats/package.json`, and `plugin.json`.
4. Run `npm ci` and `npm run check` from a clean checkout.
5. Change the GitHub repository visibility to public.
6. Create an immutable release tag:

   ```shell
   git tag -a v1.0.0 -m "Cache Stats v1.0.0"
   git push origin v1.0.0
   ```

7. Record the tag's full commit:

   ```shell
   git rev-list -n 1 v1.0.0
   ```

Do not move or replace a submitted release tag. Publish a new semantic version
for every change reviewed by a marketplace.

## 3. Submit to Awesome Copilot

Open the
[external plugin submission form](https://github.com/github/awesome-copilot/issues/new?template=external-plugin.yml).
Do not open a pull request that edits `plugins/external.json`.

Use these values:

| Field | Value |
| --- | --- |
| Plugin name | `cache-stats` |
| GitHub repository | `arafattehsin/cache-stats-extension` |
| Plugin path | Leave blank; the plugin is at repository root |
| Ref to review | `v1.0.0` |
| Commit SHA | Full SHA returned by `git rev-list` |
| Version | `1.0.0` |
| License | `MIT` |
| Author | `Arafat Tehsin` |
| Author URL | `https://github.com/arafattehsin` |
| Keywords | `aiu`, `cache`, `canvas`, `copilot`, `cost-visibility`, `prompt-cache`, `token-usage` |

Suggested description:

> Shows live prompt-cache reuse, expiry, token composition, and AIU cost for the
> current GitHub Copilot session without making model calls.

The intake automation validates the immutable repository snapshot, installs the
plugin in an isolated Copilot home, checks the canvas entry point under
`extensions/`, and verifies `assets/preview.png`.

## 4. After approval

Document the marketplace command in the release notes:

```shell
copilot plugin install cache-stats@awesome-copilot
```

For updates, increment the semantic version in all three manifests, create a new
immutable tag, and follow the marketplace update process associated with the
approved external listing.
