# @aak.lear/eslint-setup

This package simplifies the initial setup of [eslint](https://eslint.org). It installs and apply
[eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) to your project,
also resolves peerDependencies that are required for config.

## Requirements

This package doesn't install `eslint`, so if it is not already installed in your project,
you have to install it manually with npm:

```shell
npm install eslint --save-dev
```

or with yarn:

```shell
yarn add eslint -D
```

## Usage

You don't have to install this package to `node_modules`, because it is only used when setting up a project.
Call this command in your project root instead:

```shell
npx @aak.lear/eslint-setup
```

Then npx will install this package to internal cache and execute setup scripts.

After installing the necessary dependencies, in your project will be created `.eslintrc.js`,
which extends by `airbnb` config.

## Options

### 1) npm / yarn

By default, scripts will use `npm` to install config packages and peerDeps.
If you prefer `yarn`, you can add `--yarn` flag.

```shell
npx @aak.lear/eslint-setup --yarn
```

### 2) TypeScript

If you want to use TypeScript, you can add `--ts` flag. Then scripts will additionally install
[eslint-config-airbnb-typescript](https://www.npmjs.com/package/eslint-config-airbnb-typescript)
package and extend eslint configuration by airbnb typescript rules. In addition, scripts will create
file `tsconfig.eslint.json`, based on your `tsconfig.json`, and use it in eslint configuration.
Enter this command:

```shell
npx @aak.lear/eslint-setup --ts
```

### 3) Setup base config

If you don't use React, you can add `--base` flag. This command tells scripts to use `airbnb-base`
and `airbnb-typescript/base` (if `--ts` flag provided) configs, which doesn't contain react and jsx rules:

```shell
npx @aak.lear/eslint-setup --base
```

### 4) Overwrites

I don't agree with some airbnb rules and overwrite this rules in my `.eslintrc.js` when setup new projects.
By default, this setting is disabled, but you can use my overwrites with `--overwrites` flag:

```shell
npx @aak.lear/eslint-setup --overwrites
```
