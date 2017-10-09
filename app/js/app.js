'use strict';

angular.module('app', ['angularRandomString', 'LocalStorageModule'])
.constant('USER_RESOLUTION', [window.screen.width, window.screen.height])
.constant('WALLPAPER_PROVIDERS', [
{
	'name': 'unsplash.it',
	'url': 'https://unsplash.it/{x}/{y}/?random'
},
{
	'name': 'unsplash.com',
	'url': 'https://source.unsplash.com/random/{x}x{y}'
}])
.constant('PLATFORM', (process.platform == "darwin") ? 'mac' : ((process.platform == "win32" && process.arch == "x64") ? 'win64' : 'win32'))
.constant('WALLPAPERS_FOLDER', (process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])+"/.ranwall")
.value('WALLPAPER_NAME', '')
.value('isConfigWindowOpen', false)
.constant('NW', (function(){
	var requires = {
		gui: require('nw.gui'),
		wallpaper: require('wallpaper'),
		fs: require('fs'),
		mkdirp: require('mkdirp'),
		https: require('https'),
	};

	return {
		gui: requires.gui,
		win: requires.gui.Window.get(),
		wallpaper: requires.wallpaper,
		fs: requires.fs,
		mkdirp: requires.mkdirp,
		https: requires.https
	}
})())
.config(['NW', 'PLATFORM', 'localStorageServiceProvider', function(NW, _PLATFORM, localStorageServiceProvider){

	localStorageServiceProvider.setNotify(true, true);

	if (_PLATFORM == "mac") {
		var menu = new NW.gui.Menu({type: "menubar"});
		menu.createMacBuiltin && menu.createMacBuiltin("ranwall");
		NW.gui.Window.get().menu = menu;
	}

}])
.controller('mainController',['$scope', 'wall', 'localStorageService', 'NW', 'isConfigWindowOpen', 'PLATFORM', 'updater', function($scope, $wall, $localStorageService, NW, _isConfigWindowOpen, PLATFORM, $updater) {
	$updater.checkUpdate();

	NW.win.on('close', function() {
		NW.gui.App.quit();
	});

	$wall.new();

	$scope.refreshBtnClick = $wall.new;
	$scope.setBtnClick = $wall.set;

	$scope.openConfig = function () {
		if(!_isConfigWindowOpen){
			_isConfigWindowOpen = true;

			NW.gui.Window.open('app/config.html', {
				position: 'center',
				width: 466,
				height: 270,
				resizable:false
			},
			function(win){    					
				win.on('closed', function() {
					_isConfigWindowOpen = false;

					if (PLATFORM == "mac") {
						var menu = new NW.gui.Menu({type: "menubar"});
						menu.createMacBuiltin && menu.createMacBuiltin("on my wall");
						NW.gui.Window.get().menu = menu;
					}
				});
			});
		}
	}
}]).controller('configController',['$scope', 'wall', 'localStorageService', 'USER_RESOLUTION', 'WALLPAPER_PROVIDERS', function($scope, $wall, $localStorageService, _USER_RESOLUTION, _WALLPAPER_PROVIDERS) {
	var resolution = ($localStorageService.get('user_resolution') == undefined) ? _USER_RESOLUTION : JSON.parse("["+$localStorageService.get('user_resolution')+"]");
	$scope.res_x = resolution[0];
	$scope.res_y = resolution[1];
	$scope.wproviders = _WALLPAPER_PROVIDERS;
	$scope.wproviders.splice(0, 0, {"name": "All"});

	$scope.wall_provider = ($localStorageService.get('wall_provider') == undefined) ? $scope.wproviders[0] : $scope.wproviders[parseInt($localStorageService.get('wall_provider'))+1];

	$scope.$watch('wall_provider', function() {
		$localStorageService.set('wall_provider', $scope.wproviders.indexOf($scope.wall_provider)-1);
	}, true);

	$scope.$watch('res_x', function() {
		if($scope.res_x >= 1920)
			$localStorageService.set('user_resolution', [$scope.res_x, $scope.res_y]);
	}, true);

	$scope.$watch('res_y', function() {
		if($scope.res_y >= 1080)
			$localStorageService.set('user_resolution', [$scope.res_x, $scope.res_y]);
	}, true);

	$scope.resolution_input = function (size) {
		switch (size) {
			case "hd":
			$scope.res_x = 1920;
			$scope.res_y = 1080;
			break;
			case "4k":
			$scope.res_x = 3840;
			$scope.res_y = 2160;
			break;
			default:
			$scope.res_x = _USER_RESOLUTION[0];
			$scope.res_y = _USER_RESOLUTION[1];
			break;
		}
	};

	$scope.deleteCache = function () {
		$wall._purgeWallpapersFolder();
		$localStorageService.clearAll();
	}
}]).controller('updateController',['$scope','localStorageService', 'updater', 'NW', 'PLATFORM', function($scope, $localStorageService, $updater, NW, _PLATFORM){
	var manifest = JSON.parse(localStorage.getItem("ls.nv_manifest"));
	$scope.version = manifest.version;
	$scope.changes = $localStorageService.get("nv_changes");

	$scope.download = function () {
		var url = manifest.download_url[_PLATFORM];
		NW.gui.Shell.openExternal(url);
	}

	$scope.skip_version = false;
	var before_update;

	$scope.$watch('skip_version', function() {
		if($scope.skip_version){
			before_update = ($localStorageService.get("skip_version") != undefined && $localStorageService.get("skip_version") != $scope.version) ? $localStorageService.get("skip_version") : undefined;
			$localStorageService.set("skip_version", $scope.version);
		}else{
			if(before_update)
				$localStorageService.set("skip_version", before_update);
			else
				$localStorageService.remove("skip_version");
		}
	}, true);
}]);
