'use strict';

angular.module('app', ['angularRandomString', 'LocalStorageModule'])
.constant('USER_RESOLUTION', [window.screen.width, window.screen.height])
.constant('WALLPAPER_PROVIDERS', [
{
	'name': 'picsum.photos',
	'url': function(resolution) { 
		var _url = 'https://picsum.photos/{x}/{y}/?random';

		return _url.replace("{x}",resolution[0]).replace("{y}",resolution[1]); 
	},
	'get': {
		'type': 'image'
	}
},
{
	'name': 'unsplash.com',
	'url': function(resolution) { 
		var _url = 'https://source.unsplash.com/random/{x}x{y}'; 

		return _url.replace("{x}",resolution[0]).replace("{y}",resolution[1]); 
	},
	'get': {
		'type': 'image'
	}
},
{
	'name': 'wallpaperup.com',
	'url': function(resolution) { 
		return new Promise(function(resolve, reject){
			require('ranwallpaperup').random(resolution[0], resolution[1]).then(function (data) {
				resolve(data.url);
			});
		});
	},
	'get': {
		'type': 'image'
	}
}])
.constant('PLATFORM', (process.platform == "darwin") ? 'mac' : ((process.platform == "win32" && process.arch == "x64") ? 'win64' : 'win32'))
.constant('WALLPAPERS_FOLDER', (process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])+"/.ranwall")
.value('WALLPAPER_NAME', '')
.value('ConfigWindow', null)
.value('MAGIC_SHORTCUT', { 'modifiers': 'Command+Shift', 'key':'W'})
.constant('NW', (function(){
	var requires = {
		gui: require('nw.gui'),
		wallpaper: require('wallpaper'),
		fs: require('fs'),
		mkdirp: require('mkdirp'),
		http: require('follow-redirects').http,
		https: require('follow-redirects').https,
		autoLaunch: require('auto-launch'),
		dialog: require('nw-dialog'),
		rwallpaperup: require('ranwallpaperup')
	};

	return {
		gui: requires.gui,
		win: requires.gui.Window.get(),
		wallpaper: requires.wallpaper,
		fs: requires.fs,
		mkdirp: requires.mkdirp,
		http: requires.http,
		https: requires.https,
		autoLaunch: requires.autoLaunch,
		dialog: requires.dialog,
		rwallpaperup: requires.rwallpaperup
	}
})())
.config(['NW', 'PLATFORM', 'localStorageServiceProvider', function(NW, _PLATFORM, localStorageServiceProvider){

	localStorageServiceProvider.setNotify(true, true);

	if (_PLATFORM == "mac") {
		var menu = new NW.gui.Menu({type: "menubar"});
		menu.createMacBuiltin && menu.createMacBuiltin("ranwall");
		NW.gui.Window.get().menu = menu;
	}

}]).run(['MAGIC_SHORTCUT', function(_MAGIC_SHORTCUT){

	document.body.addEventListener('dragover', function(e){
		e.preventDefault();
		e.stopPropagation();
	}, false);
	document.body.addEventListener('drop', function(e){
		e.preventDefault();
		e.stopPropagation();
	}, false);

	if(localStorage.getItem("ls.shortcut_key")){
		var shortcut = JSON.parse(localStorage.getItem("ls.shortcut_key"));
		_MAGIC_SHORTCUT.key = shortcut.key;
		_MAGIC_SHORTCUT.modifiers = shortcut.modifiers;
	}
}]);
