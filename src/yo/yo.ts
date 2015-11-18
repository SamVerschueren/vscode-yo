'use strict';

import * as fs from 'fs';
import * as _ from 'lodash';

import createEnvironment from './environment';

const readPkgUp = require('read-pkg-up');
const semver = require('semver')

export default class Yeoman {

	private _env: any;

	public constructor() {
		this._env = createEnvironment();
	}

	public getEnvironment(): any {
		return this._env;
	}

	public getGenerators(): any[] {
		var generatorsMeta = this._env.store.getGeneratorsMeta();

		// Remove sub generators from list
		var list = _.filter(generatorsMeta, item => {
			return (<any>item).namespace.split(':')[1] === 'app';
		});

		list = list.map((item: any) => {
			const pkgPath = readPkgUp.sync({cwd: item.resolved});
			if (!pkgPath.pkg) {
				return null;
			}

			const pkg = pkgPath.pkg;
			const generatorVersion: any = pkg.dependencies['yeoman-generator'];
			const generatorMeta: any = _.pick(pkg, 'name', 'version', 'description');

			// Flag generator to indecate if the generator version is fully supported or not.
			// https://github.com/yeoman/yeoman-app/issues/16#issuecomment-121054821
			generatorMeta.isCompatible = semver.ltr('0.17.6', generatorVersion);

			// Indicator to verify official generators
			generatorMeta.officialGenerator = false;
			if (generatorMeta.repository && generatorMeta.repository.url) {
				generatorMeta.officialGenerator = generatorMeta.repository.url.indexOf('github.com/yeoman/') > -1;
			}

			return generatorMeta;
		});

		return _.compact(list);
	}

	public run(generator: string, cwd: string) {
		// TODO test if cwd exists

		process.chdir(cwd);

		const prefix = 'generator-';
		if (generator.indexOf(prefix) === 0) {
			generator = generator.slice(prefix.length);
		}

		this._env.run(generator, this.done)
			.on('npmInstall', () => {
				console.log('running npm install');
			})
			.on('bowerInstall', () => {
				console.log('running bower install');
			})
			.on('end', () => {
				console.log('done');
			});
	}

	private done(err) {
		if (err) {
			// handle error
		}
	}
}
