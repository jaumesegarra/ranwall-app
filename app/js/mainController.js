'use strict';

angular.module('app')
.controller('mainController',['$scope', 'wall', 'localStorageService', 'NW', 'ConfigWindow', 'PLATFORM', 'win', 'updater', 'MAGIC_SHORTCUT', 'previewer', function($scope, $wall, $localStorageService, NW, _ConfigWindow, PLATFORM, $win, $updater, _MAGIC_SHORTCUT, $previewer) {
	
	$wall.prepareElement();

	function setNewWallpaperAuto() {
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
			setNewWallpaperAuto();
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
	$win.command(_MAGIC_SHORTCUT.modifiers+"+"+_MAGIC_SHORTCUT.key, setNewWallpaperAuto);
	$updater.checkUpdate();

	$wall.new();

	var wallPreview = null;

	$scope.current_wallpaper = $wall.current_wallpaper;

	function allowRefresh(){
		$scope.previewup = $previewer.up;
		$scope.previewdown = $previewer.down;
	}

	function disableRefresh(){
		$scope.previewup = null;
		$scope.previewdown = null;
	}

	WebPullToRefresh.init({
		startFunction: function (){
			disableRefresh();

			document.querySelectorAll("header > .message").forEach(e => e.parentNode.removeChild(e));
		},
		loadingFunction: function (){
			return new Promise( function( resolve, reject ) { 
				resolve();
				$wall.new();
				checkPreview();
			})
		}
	});

	$scope.$watch(function () { return $localStorageService.get("configPreview"); },function(){
		wallPreview = ($localStorageService.get("configPreview"));
		checkPreview();
	});

	function checkPreview(){
		if(wallPreview)
			allowRefresh();
		else
			disableRefresh();
	}

	checkPreview();

	$scope.refreshBtnClick = $wall.new;

	$scope.setBtnClick = $wall.set;
	$scope.saveasBtnClick = function () {
		$wall.saveas();
	}

	$scope.openConfig = openConfig;
}])