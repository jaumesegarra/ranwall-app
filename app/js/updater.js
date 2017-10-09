'use strict';

/**
 * @ngdoc function
 * @name app.updater
 * @description
 * # updater
 * Factory in the app
 */
 angular.module('app')
 .factory('updater', ['NW', 'localStorageService','$http', 'PLATFORM', function(NW, $localStorageService, $http, _PLATFORM) {
 	var obj = {
 		_manifestJSON: require('../package.json'),
 		_getVersion: function () {
 			return obj._manifestJSON.version;
 		},
 		checkUpdate: function (forceAlert) {
 			var currentVersion = obj._getVersion;
 			var url = "https://raw.githubusercontent.com/"+(obj._manifestJSON.repository.replace("https://github.com/", ""))+"/master/package.json";
 			
 			$http.get(url)
 			.then(function(response) {
 				var _manifest_github = response.data;
 				
 				if(parseFloat(_manifest_github.version.replace(".","")) > parseFloat(obj._getVersion().replace(".",""))){ 					
 					if($localStorageService.get("skip_version") == undefined || $localStorageService.get("skip_version") != _manifest_github.version || forceAlert){
 						
 						$localStorageService.set("nv_manifest", _manifest_github);

 						var url_changes = "https://raw.githubusercontent.com/"+(obj._manifestJSON.repository.replace("https://github.com/", ""))+"/master/changes.txt";
 						$http.get(url_changes)
 						.then(function(response) {
 							$localStorageService.set("nv_changes", response.data);

 							NW.gui.Window.open('app/updater.html', {
 								position: 'center',
 								width: 466,
 								height: 290,
 								resizable:false
 							},
 							function(win){    					
 								win.on('closed', function() {
 									$localStorageService.remove("nv_manifest");
 									$localStorageService.remove("nv_changes");

 									if (_PLATFORM == "mac") {
 										var menu = new NW.gui.Menu({type: "menubar"});
 										menu.createMacBuiltin && menu.createMacBuiltin("on my wall");
 										NW.gui.Window.get().menu = menu;
 									}
 								});
 							});
 						});
 					}
 				}
 			});
 		}
 	}
 	return obj;
 }]);