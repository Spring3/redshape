# Development

On every update, you should modify:

- `package.json`: `version`.
- `common/migrations.js`: update the settings' migrations for the new version (if applicable).
- update jest snapshots (check section Tests).
- update the PKGBUILD version and hash, as a linux target (check PKGBUILD).
- finally, git add and commit.
- upload the PKGBUILD tar gz (support/package-aur/redshape-X.Y.Z.tar.gz).

## Debug in production

Enabled two env vars:
- `DEV_TOOLS=1`: toggle true developer tools.
- `ELECTRON_IS_DEV=1`: toggle true the variable `isDev` found in the code.

## PKGBUILD

```
npm run release:aur
```

## Building

### Pacman-based (ArchLinux)

To build:

```
cd support/package-aur
makepkg -f
```

To re-build without downloading `node_modules` (`fd` take care of this). It is important to remove
previous assets because if not some resources are not rebuild.

```
cd support/package-aur
rm -rf pkg 
fd --maxdepth 1 . src/redshape-X.Y.Z --exec rm -rf 
makepkg -f
```

### Deb

```
npm run build
```

## Tests

Updating jest snapshots:

```
ELECTRON_RUN_AS_NODE=true electron node_modules/.bin/jest --updateSnapshot --detectOpenHandles --maxWorkers=2 .
```

Running all:

```
ELECTRON_RUN_AS_NODE=true electron node_modules/.bin/jest --detectOpenHandles --maxWorkers=2 .
```

Or a specific test:

```
ELECTRON_RUN_AS_NODE=true electron node_modules/.bin/jest --detectOpenHandles --maxWorkers=2 -t 'MarkdownEditor component'
```
