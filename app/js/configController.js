'use strict';

angular.module('app')
.controller('configController',['$scope', 'wall', 'win', 'localStorageService', 'USER_RESOLUTION', 'WALLPAPER_PROVIDERS', 'MAGIC_SHORTCUT', function($scope, $wall, $win, $localStorageService, _USER_RESOLUTION, _WALLPAPER_PROVIDERS, _MAGIC_SHORTCUT) {
	$win._checkIfShowAtLaunch();
	
	$scope.launchAtStartup= ($localStorageService.get("configLaunchAtStartup") == undefined || $localStorageService.get("configLaunchAtStartup") == 0) ? false : true;
	$scope.$watch('launchAtStartup', function() {
		$win.launchAtStartup($scope.launchAtStartup);
	}, true);

	$scope.hideAtLaunch = ($localStorageService.get("configHideOnStartup") == undefined || $localStorageService.get("configHideOnStartup") == 0) ? false : true;
	$scope.$watch('hideAtLaunch', function() {
		$win.hideOnStartup($scope.hideAtLaunch);
	}, true);

	var resolution = ($localStorageService.get('user_resolution') == undefined) ? _USER_RESOLUTION : JSON.parse("["+$localStorageService.get('user_resolution')+"]");
	$scope.res_x = resolution[0];
	$scope.res_y = resolution[1];

	function inArray(x, arr) {
		for(var i = 0; i < arr.length; i++) {
			if(x === arr[i]) return true;
		}
		return false;
	}

	var wproviders = _WALLPAPER_PROVIDERS;
	var providers_active = [];

	if ($localStorageService.get('wall_providers') == undefined){
		providers_active = $wall.getAllProviders();
	}else{
		providers_active = JSON.parse(localStorage.getItem('ls.wall_providers'));
	}

	for (var pr in wproviders){
		wproviders[pr].status=(providers_active.indexOf(pr) != -1);
	}

	$scope.wproviders = wproviders;

	$scope.providersChanged = function(){
		for(var key in $scope.wproviders) {
			$scope.wproviders[key].status = inArray(key, $scope.selectedProviders);
		}
	};

	$scope.$watch('wproviders', function() {
		if($scope.selectedProviders){
			var selectedProviders = $scope.selectedProviders;
			localStorage.setItem("ls.wall_providers", JSON.stringify(selectedProviders));
		}
	},true);

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

	$scope.magicShortcut = _MAGIC_SHORTCUT.modifiers+"+"+_MAGIC_SHORTCUT.key;

	function show_shortcut(ms, ks){
		var shortcut = "";
		switch (ms.length) {
			case 0:
			shortcut = "";
			break;
			case 1:
			shortcut = ms[0];
			break;
			default:
			shortcut = ms[0]+"+"+ms[1];
			break;
		}

		shortcut += ((ks!="") ? ((ms.length > 0) ? '+' : '- +')+ks : '');

		$scope.magicShortcut = shortcut;
		$scope.$apply();
	}

	function is_valid_shortcut(ms, ks){
		return (ks.length>0 && ms.length>0);
	}

	$scope.magicShortcut_recording = false;
	$scope.record_shortcut = function(){
		if(!$scope.magicShortcut_recording){
			$scope.magicShortcut_recording = true;

			var input = document.getElementById("magicShortcut");
			input.focus();
			$scope.magicShortcut = "- - -";

			var key = "";
			var modifiers = [];

			angular.element(input).on('keyup', function(e){
				e.preventDefault();
				console.log(e.key);

				if(e.key == "Meta" || e.key == "Control" || e.key == "Alt" || e.key == "Shift"){
					var tag_key = e.key.replace("Meta", "Command").replace("Control", "Ctrl");

					switch (modifiers.length) {
						case 0:
						modifiers[0] = tag_key;
						break;
						case 1:
						if(modifiers[0] != tag_key)
							modifiers[1] = tag_key;
						break;
						default:
						modifiers = [];
						modifiers[0] = tag_key;
						break;
					}
				}else if(new RegExp("^[a-zA-Z]$").test(e.key) || new RegExp("^F[1-9]$").test(e.key)){
					key = e.key.toUpperCase();
				}

				show_shortcut(modifiers, key);
			});	

			angular.element(input).on('blur', function(){
				stop_capture();

				if(is_valid_shortcut(key, modifiers)){
					_MAGIC_SHORTCUT.modifiers = (modifiers.length == 1) ?  modifiers[0] : modifiers[0]+"+"+modifiers[1];
					_MAGIC_SHORTCUT.key = key;

					localStorage.setItem("ls.shortcut_key", JSON.stringify(_MAGIC_SHORTCUT));
				}else
				$scope.magicShortcut = _MAGIC_SHORTCUT.modifiers+"+"+_MAGIC_SHORTCUT.key;

				$scope.$apply();
			});
		}
	}

	function stop_capture() {
		angular.element(document.getElementById("magicShortcut")).off();

		$scope.magicShortcut_recording = false;
	}

	$scope.deleteCache = function () {
		$wall._purgeWallpapersFolder();
		$localStorageService.clearAll();
	}
}])