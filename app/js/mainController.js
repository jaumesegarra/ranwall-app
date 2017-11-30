'use strict';

angular.module('app')
.controller('mainController',['$scope', 'wall', 'localStorageService', 'NW', 'ConfigWindow', 'PLATFORM', 'win', 'updater', 'MAGIC_SHORTCUT', 'WALLPAPER_NAME', function($scope, $wall, $localStorageService, NW, _ConfigWindow, PLATFORM, $win, $updater, _MAGIC_SHORTCUT, _WALLPAPER_NAME) {
	
	$wall.prepareElement();

	function setNewWallpaper() {
		$wall.new(true, true);
	}

	function openConfig() {
		if(_ConfigWindow == null){

			NW.gui.Window.open('app/config.html', {
				position: 'center',
				width: 485,
				height: 310,
				resizable:false
			},
			function(win){    
				_ConfigWindow = win;

				win.on('closed', function() {
					_ConfigWindow = null;

					if (PLATFORM == "mac") {
						var menu = new NW.gui.Menu({type: "menubar"});
						menu.createMacBuiltin && menu.createMacBuiltin("ranwall");
						NW.gui.Window.get().menu = menu;
					}
				});
			});

		}else _ConfigWindow.focus();
	}

	var menu = [
	{
		"name": "Set new wallpaper!",
		"key": _MAGIC_SHORTCUT.key, 
		"modifiers": _MAGIC_SHORTCUT.modifiers,
		"click": function(){
			setNewWallpaper();
		}
	},
	{
		"separator": 1
	},
	{
		"name":"Show/Hide",
		"click": function(){
			$win.toggleShow();
		}
	},
	{
		"name":"Configuration",
		"click": function(){
			openConfig();
		}
	},
	{
		"name": "Check for updates",
		"click": function(){
			$updater.checkUpdate(true,true);
		}
	},
	{
		"name": "Exit",
		"click": function () {
			NW.gui.App.quit();
		}
	}
	];

	$win.atLaunch(menu);
	$win.command(_MAGIC_SHORTCUT.modifiers+"+"+_MAGIC_SHORTCUT.key, setNewWallpaper);
	$updater.checkUpdate();

	$wall.new();

	$scope.refreshBtnClick = $wall.new;
	$scope.setBtnClick = $wall.set;
	$scope.saveasBtnClick = function () {
		$wall.saveas();
	}

	$scope.openConfig = openConfig;
}])