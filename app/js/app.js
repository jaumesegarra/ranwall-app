'use strict';

angular.module('app', ['angularRandomString', 'LocalStorageModule'])
	.constant('USER_RESOLUTION', [window.screen.width, window.screen.height])
	.constant('URL_RANDOM_WALLPAPERS','http://unsplash.it/{x}/{y}/?random')
	.constant('PLATFORM', process.platform)
	.constant('WALLPAPERS_FOLDER', (process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])+"/.ranwall")
    .value('WALLPAPER_NAME', '')
    .value('isConfigWindowOpen', false)
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
	.controller('mainController',['$scope', 'wall', 'localStorageService', 'NW', 'isConfigWindowOpen', 'PLATFORM', function($scope, $wall, $localStorageService, NW, _isConfigWindowOpen, PLATFORM) {
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
					height: 216,
					resizable:false
				},
				function(win){    					
					win.on('closed', function() {
						_isConfigWindowOpen = false;

						if (PLATFORM == "darwin") {
							var menu = new NW.gui.Menu({type: "menubar"});
							menu.createMacBuiltin && menu.createMacBuiltin("on my wall");
							NW.gui.Window.get().menu = menu;
						}
					});
				});
			}
		}
	}]).controller('configController',['$scope', 'wall', 'localStorageService', 'USER_RESOLUTION', function($scope, $wall, $localStorageService, _USER_RESOLUTION) {
		var resolution = ($localStorageService.get('user_resolution') == undefined) ? _USER_RESOLUTION : JSON.parse("["+$localStorageService.get('user_resolution')+"]");
		$scope.res_x = resolution[0];
		$scope.res_y = resolution[1];

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
	}]);
