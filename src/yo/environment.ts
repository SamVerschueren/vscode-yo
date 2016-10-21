import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import {EOL} from 'os';
import CodeAdapter from './adapter';
const yeoman = require('yeoman-environment');
const uniq = require('array-uniq');

const win32 = process.platform === 'win32';

const getNpmPaths = function () {
	if (process.env.NODE_PATH) {
		return process.env.NODE_PATH.split(path.delimiter);
	}

	require('fix-path')();

	// Get the npm path from the user env variables.
	const paths = process.env.PATH.split(path.delimiter).map(item => path.join(item, '..', 'lib', 'node_modules'));

	// Default paths for each system
	if (win32) {
		paths.push(path.join(process.env.APPDATA, 'npm', 'node_modules'));
	} else {
		paths.push('/usr/lib/node_modules');
	}

	try {
		// Somehow `npm get prefix` does not return the correct value
		const userconfig = childProcess.execSync('npm get userconfig', {encoding: 'utf8'}).toString().trim();
		const content = fs.readFileSync(userconfig).toString('utf8');
		const match = content.match(new RegExp(`prefix=(.*?)${EOL}`));

		if (match) {
			if (win32) {
				paths.push(path.join(match[1], 'node_modules'));
			} else {
				paths.push(path.join(match[1], 'lib', 'node_modules'));
			}
		}
	} catch (err) {

	}

	return uniq(paths.reverse());
};

export default function (args?: any[], opts?: any) {
	args = args || [];
	opts = opts || {};

	let env = yeoman.createEnv(args, opts, new CodeAdapter());
	env.getNpmPaths = getNpmPaths;

	return env;
}
