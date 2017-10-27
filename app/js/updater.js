'use strict';

/**
 * @ngdoc function
 * @name app.updater
 * @description
 * # updater
 * Factory in the app
 */
 angular.module('app')
 .factory('updater', ['NW', 'localStorageService','PLATFORM', function(NW, $localStorageService, _PLATFORM) {
 	var obj = {
 		_manifestJSON: require('../package.json'),
 		_isOpenUpdateWindow: false,
 		_getVersion: function () {
 			return obj._manifestJSON.version;
 		},
 		checkUpdate: function (forceAlert, showNoUpdate) {
 			var currentVersion = obj._getVersion;
 			var url = "https://jaumesegarra.github.io/ranwall-app/latest.json";
 			
 			NW.https.get(url, function(response) {
 				var data = '';

 				response.on('data', function (chunk){
 					data += chunk;
 				});

 				response.on('end',function(){
 					var _manifest_github = JSON.parse(data);

 					if(parseFloat(_manifest_github.version.replace(".","")) > parseFloat(obj._getVersion().replace(".",""))){ 					
 						if(($localStorageService.get("skip_version") == undefined || $localStorageService.get("skip_version") != _manifest_github.version || forceAlert) && !obj._isOpenUpdateWindow)
 							obj.showUpdateWindow(_manifest_github);
 					} else if (showNoUpdate) 
 					alert("No updates availables!");
 				})
 				
 			});
 		},
 		showUpdateWindow: function (_manifest_github) {
 			$localStorageService.set("nv_manifest", _manifest_github);

 			obj._isOpenUpdateWindow = true;

 			NW.gui.Window.open('app/updater.html', {
 				position: 'center',
 				width: 466,
 				height: 290,
 				resizable:false
 			},
 			function(win){    					
 				win.on('closed', function() {
 					$localStorageService.remove("nv_manifest");
 					obj._isOpenUpdateWindow = false;

 					if (_PLATFORM == "mac") {
 						var menu = new NW.gui.Menu({type: "menubar"});
 						menu.createMacBuiltin && menu.createMacBuiltin("ranwall");
 						NW.gui.Window.get().menu = menu;
 					}
 				});
 			});
 		}
 	}
 	return obj;
 }]);