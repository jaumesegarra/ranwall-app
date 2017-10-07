'use strict';

angular.module('app', ['angularRandomString', 'LocalStorageModule'])
	.constant('URL_RANDOM_WALLPAPERS','http://unsplash.it/1920/1080/?random')
	.constant('PLATFORM', process.platform)
	.constant('WALLPAPERS_FOLDER', (process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])+"/Library/ranwall")
    .constant('WALLPAPER_NAME', '')
    .constant('NW', (function(){
	    var requires = {
		    gui: require('nw.gui'),
		    wallpaper: require('wallpaper'),
		    fs: require('fs'),
            mkdirp: require('mkdirp'),
            http: require('http')
	    };
	    
	    return {
		    gui: requires.gui,
		    win: requires.gui.Window.get(),
		    wallpaper: requires.wallpaper,
		    fs: requires.fs,
            mkdirp: requires.mkdirp,
            http: requires.http
	    }
    })())
    .config(['NW', 'PLATFORM', 'localStorageServiceProvider', function(NW, _PLATFORM, localStorageServiceProvider){

    	localStorageServiceProvider.setNotify(true, true);

		if (_PLATFORM == "darwin") {
            var menu = new NW.gui.Menu({type: "menubar"});
            menu.createMacBuiltin && menu.createMacBuiltin("ranwall");
            NW.gui.Window.get().menu = menu;
        }
	}])
	.controller('mainController',['$scope', 'wall', 'localStorageService', function($scope, $wall, $localStorageService) {
		$wall.new();

		$scope.refreshBtnClick = $wall.new;
		$scope.setBtnClick = $wall.set;
	}]);
