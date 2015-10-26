'use strict';

import * as fs from 'fs';
import * as _ from 'lodash';

import createEnvironment from './environment';

const findup = require('findup-sync');
const semver = require('semver')

export default class Yeoman {

	private _env: any;

	public constructor() {
		this._env = createEnvironment();
	}

	public getEnvironment(): any {
		return this._env;
	}

	public getGenerators() {
		var generatorsMeta = this._env.store.getGeneratorsMeta();

		// Remove sub generators from list
		var list = _.filter(generatorsMeta, item => {
			return (<any>item).namespace.split(':')[1] === 'app';
		});

		list = list.map(item => {
			const pkgPath = findup('package.json', {cwd: (<any>item).resolved});
			if (!pkgPath) {
				return null;
			}

			const pkg: any = JSON.parse(fs.readFileSync(pkgPath).toString());
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

	public run(generator: string, cwd?: string) {
		const prefix = 'generator-';

		if (generator.indexOf(prefix) === 0) {
			generator = generator.slice(prefix.length);
		}

		this._env.run(generator, err => {
			if (err) {
				// Handle Error
			}
		}).on('end', function () {
			console.log('end');
		});
	}
}
