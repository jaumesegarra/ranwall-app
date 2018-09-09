'use strict';

const path = require('path');
const childProcess = require('child_process');
const pify = require('pify');

const execFile = pify(childProcess.execFile);

let bin_name; let params;

if (process.platform == 'darwin'){
	bin_name = 'wallsh-macos';
	params = ['-g', '-s'];
} else if (process.platform == 'win32'){
	bin_name = 'wallsh-windows.exe';
	params = ['/G', '/S'];
}

const bin = path.join(__dirname, 'bin/'+bin_name);

exports.get = () => execFile(bin, [params[0]]).then(x => x.trim());

exports.set = (imagePath) => {
	if (typeof imagePath !== 'string') {
		return Promise.reject(new TypeError('Expected a string'));
	}

	return execFile(bin, [params[1], path.resolve(imagePath)]);
};

