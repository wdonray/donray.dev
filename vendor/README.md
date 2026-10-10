# Vendored packages

`wdonray-analytics-core-1.0.1.tgz` is vendored here because Amplify's build
cannot authenticate to GitHub Packages (no NODE_AUTH_TOKEN in the build
environment), which broke all deployments after the package was introduced.

To update: `npm pack @wdonray/analytics-core@<version>` (with a GitHub token
that has `read:packages`), drop the new tarball here, and update the
`file:` reference in package.json.

If GitHub Packages auth is ever set up in Amplify, this can be reverted to
the registry version.
