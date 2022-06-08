#!/usr/bin/env node

const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const spawn = require('cross-spawn');

const packageJson = require('./package.json');

const getPeerDeps = (configName) => new Promise((resolve, reject) => {
    const command = 'npm';
    const args = [
        'info',
        `eslint-config-${configName}@latest`,
        'peerDependencies',
        '--json',
    ];
    const child = spawn(command, args);

    child.stdout.on('data', (data) => {
        resolve(JSON.parse(data));
    });

    child.on('close', (code) => {
        if (code !== 0) {
            reject({
                command: `${command} ${args.join(' ')}`,
            });
        }
    });
});

const preparePeerDeps = (...depsArr) => {
    const dependencies = Object.assign({}, ...depsArr);
    return Object.entries(dependencies)
        .filter(([key]) => key !== 'eslint')
        .map(([dependency, version]) => {
            const v = version.split('||')[0].trim();
            return `${dependency}@${v}`;
        });
};

const baseConfigMapping = {
    'airbnb-typescript': 'airbnb-typescript/base'
};

function install(
    root,
    dependencies,
    useYarn,
    verbose = false
) {
    return new Promise((resolve, reject) => {
        let command;
        let args;
        if (useYarn) {
            command = 'yarn';
            args = ['add', '--exact', '-D'];
            [].push.apply(args, dependencies);

            // Explicitly set cwd() to work around issues like
            // https://github.com/facebook/create-react-app/issues/3326.
            // Unfortunately we can only do this for Yarn because npm support for
            // equivalent --prefix flag doesn't help with this issue.
            // This is why for npm, we run checkThatNpmCanReadCwd() early instead.
            args.push('--cwd');
            args.push(root);
        } else {
            command = 'npm';
            args = [
                'install',
                '--no-audit', // https://github.com/facebook/create-react-app/issues/11174
                '--save',
                '--save-exact',
                '--loglevel',
                'error',
            ].concat(dependencies);
        }

        if (verbose) {
            args.push('--verbose');
        }

        const child = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

const main = async ({
    useYarn,
    ts,
    base,
    overwrites,
    verbose,
}) => {
    const root = process.cwd();

    const configs = base
        ? ['airbnb-base']
        : ['airbnb'];

    if (ts) {
        configs.push('airbnb-typescript');
    }

    const copyTemplate = (name) => {
        try {
            fs.copySync(
                path.resolve(__dirname, 'src/templates', name),
                path.resolve(root, name)
            );
        } catch (err) {
            console.log(chalk.red(err));
        }
    };

    const peerDepsArr = await Promise
        .all(configs.map(getPeerDeps));

    const peerDeps = preparePeerDeps(...peerDepsArr);

    const dependencies = [
        ...configs.map(name => `eslint-config-${name}@latest`),
        ...peerDeps
    ];

    console.log(`Installing packages:\n${chalk.cyan(dependencies.join('\n'))}`);
    console.log('');

    await install(root, dependencies, useYarn, verbose);

    console.log('');
    console.log(`Creating ${chalk.cyan('.eslintrc.js')}`);
    console.log('');

    const configTemplate = {
        extends: base
            ? configs.map((name) => baseConfigMapping[name] || name)
            : configs,
        rules: {},
    };

    if (overwrites) {
        configTemplate.extends.push('./.overwrites.eslintrc.js');
    }

    if (ts) {
        configTemplate.parserOptions = {
            project: './tsconfig.eslint.json',
        }
    }

    const eslintrcData = JSON.stringify(configTemplate, null, 4)

    fs.outputFileSync(
        path.resolve(root, '.eslintrc.json'),
        eslintrcData,
    );

    if (ts) {
        console.log(`Creating ${chalk.cyan('tsconfig.eslint.json')}`);
        console.log('');
        copyTemplate('tsconfig.eslint.json');
    }

    if (overwrites) {
        console.log(`Creating ${chalk.cyan('.overwrites.eslintrc.js')}`);
        console.log('');
        copyTemplate('.overwrites.eslintrc.js');
    }

    console.log(`${chalk.green('Success!')}`);

};

const init = () => {
    const program = new commander.Command(packageJson.name)
        .version(packageJson.version)
        .usage(`[options]\nUse this in root of your project`)
        .option('--yarn', 'use yarn instead of npm to install required packages')
        .option('--ts', 'extend eslint configuration with typescript rules')
        .option('--base', 'use base versions of eslint configs (exclude React and JSX rules)')
        .option('--overwrites', 'use my overwrites to change some airbnb rules')
        .option('--verbose', 'print additional logs')
        .parse(process.argv);

    const {
        yarn,
        ts,
        base,
        overwrites,
        verbose,
    } = program;

    main({
        useYarn: yarn,
        ts,
        base,
        overwrites,
        verbose,
    })
        .catch(e => console.log(chalk.red(e)));
};

init();

