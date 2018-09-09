'use strict';

angular.module('app')
.factory('globalruns', ['$rootScope', 'localStorageService', 'NW', 'win', 'MAGIC_SHORTCUT', 'UserConfig', 'updater', function($scope, $localStorageService, NW, $win, _MAGIC_SHORTCUT, _UserConfig, $updater) {
	var _ConfigWindow;
	
	var menu = [
	{
		"name": "Set new wallpaper!",
		"key": _MAGIC_SHORTCUT.key, 
		"modifiers": _MAGIC_SHORTCUT.modifiers,
		"click": null
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
			obj.openConfig();
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

	var obj = {
		initials: function (setWallpaperFunc) {
			$updater.checkUpdate();

			obj.setTrayMenu(setWallpaperFunc);
			obj.setCommands(setWallpaperFunc);

			obj.checkTheme();
		},
		setTrayMenu: function(setWallpaperFunc){
			menu[0].click = setWallpaperFunc;
			$win.atLaunch(menu);
		},
		setCommands: function(setWallpaperFunc){
			$win.command(_MAGIC_SHORTCUT.modifiers+"+"+_MAGIC_SHORTCUT.key, setWallpaperFunc);
		},
		checkTheme: function(){
			$scope.$watch(function () { return $localStorageService.get("LightTheme"); },function(){
				var isLight = _UserConfig.LightTheme();

				if(isLight)
					document.body.classList.add('light');
				else
					document.body.classList.remove('light');
			});
		},
		openConfig: function() {
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
	};

	return obj;
}])