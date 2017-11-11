'use strict';

angular.module('app')
.controller('updateController',['$scope','localStorageService', 'updater', 'NW', 'PLATFORM', function($scope, $localStorageService, $updater, NW, _PLATFORM){
	var manifest = JSON.parse(localStorage.getItem("ls.nv_manifest"));
	$scope.version = manifest.version;
	$scope.changes = manifest.changes;

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
}])