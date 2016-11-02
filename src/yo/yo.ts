import {window, StatusBarItem, StatusBarAlignment} from 'vscode';
import {EOL} from 'os';
import * as fs from 'fs';
import * as _ from 'lodash';
import createEnvironment from './environment';
import EscapeException from '../utils/EscapeException';
const readPkgUp = require('read-pkg-up');
const semver = require('semver');
const elegantSpinner = require('elegant-spinner');
const figures = require('figures');

const frame = elegantSpinner();

export default class Yeoman {

	private _options: any;
	private _env: any;
	private _status: StatusBarItem;
	private _interval: any;

	public constructor(options?: any) {
		this._options = options;
		this._env = createEnvironment(undefined, options);
		this._status = window.createStatusBarItem(StatusBarAlignment.Left);
		this._interval;
	}

	public getEnvironment(): any {
		return this._env;
	}

	public getGenerators(): any[] {
		const generatorsMeta = this._env.store.getGeneratorsMeta();

		// Remove sub generators from list
		let list = Object.keys(generatorsMeta).filter((key: any) => key.split(':')[1] === 'app');

		list = list.map(key => {
			const item = generatorsMeta[key];
			const name = key.split(':')[0];

			const pkgPath = readPkgUp.sync({cwd: item.resolved});
			if (!pkgPath.pkg) {
				return null;
			}

			const pkg = pkgPath.pkg;
			const generatorVersion: any = pkg.dependencies['yeoman-generator'];
			const generatorMeta: any = _.pick(pkg, 'name', 'version', 'description');

			// Ignore the generator if does not depend on `yeoman-generator`
			if (!generatorVersion) {
				return null;
			}

			// Flag generator to indecate if the generator version is fully supported or not.
			// https://github.com/yeoman/yeoman-app/issues/16#issuecomment-121054821
			generatorMeta.isCompatible = semver.ltr('0.17.6', generatorVersion);

			// Indicator to verify official generators
			generatorMeta.officialGenerator = false;
			if (generatorMeta.repository && generatorMeta.repository.url) {
				generatorMeta.officialGenerator = generatorMeta.repository.url.indexOf('github.com/yeoman/') > -1;
			}

			// Add subgenerators
			generatorMeta.subGenerators = Object.keys(generatorsMeta).reduce((result, key: any) => {
				const split = key.split(':');

				if (split[0] === name) {
					result.push(split[1]);
				}

				return result;
			}, []);

			return generatorMeta;
		});

		return _.compact(list);
	}

	public run(generator: string, cwd: string) {
		if (!cwd) {
			throw new Error('Please open a workspace directory first.');
		}

		process.chdir(cwd);

		const prefix = 'generator-';
		if (generator.indexOf(prefix) === 0) {
			generator = generator.slice(prefix.length);
		}

		return new Promise((resolve, reject) => {
			Promise.resolve(window.showQuickPick(new Promise((res, rej) => {
				setImmediate(() => {
					try {
						this._env.run(generator, this.done)
							.on('npmInstall', () => {
								this.setState('install node dependencies');
							})
							.on('bowerInstall', () => {
								this.setState('install bower dependencies');
							})
							.on('error', err => {
								if (!(err instanceof EscapeException)) {
									window.showErrorMessage(err.message);
									throw err;
								}
							})
							.on('end', () => {
								this.clearState();
								console.log(`${EOL}${figures.tick} done`);
							});

						resolve();
					} catch (err) {
						reject(err);
					}

					rej();
				});
			}))).catch(err => {
				// do nothing because the input is always rejected
			});
		});
	}

	private setState(state: string) {
		console.log(state);

		this._status.show();
		this._status.tooltip = state;

		this._interval = setInterval(() => {
			this._status.text = `${frame()} yo`;
		}, 50);
	}

	private clearState() {
		clearInterval(this._interval);
		this._status.dispose();
	}

	private done(err) {
		if (err) {
			// handle error
		}
	}
}
