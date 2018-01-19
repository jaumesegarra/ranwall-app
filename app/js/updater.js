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
 	var _updateWindow = null;

 	function _versionToNumber (v){
 		return parseFloat(v.replace(".",""));
 	};

 	function _showUpdateWindow(_manifest_github) {
 		if(_updateWindow == null){
 			$localStorageService.set("nv_manifest", _manifest_github);

 			NW.gui.Window.open('app/updater.html', {
 				position: 'center',
 				width: 466,
 				height: 290,
 				resizable:false
 			},
 			function(win){   
 				_updateWindow = win;

 				win.on('closed', function() {
 					$localStorageService.remove("nv_manifest");
 					_updateWindow = null;

 					if (_PLATFORM == "mac") {
 						var menu = new NW.gui.Menu({type: "menubar"});
 						menu.createMacBuiltin && menu.createMacBuiltin("ranwall");
 						NW.gui.Window.get().menu = menu;
 					}
 				});
 			});
 		} else _updateWindow.focus();
 	};

 	var obj = {
 		checkUpdate: function (forceAlert, showNoUpdate) {
 			var currentVersion = NW.gui.App.manifest.version;
 			var url = "https://jaumesegarra.github.io/ranwall-app/latest.json";
 			
 			NW.https.get(url, function(response) {
 				var data = '';

 				response.on('data', function (chunk){
 					data += chunk;
 				});

 				response.on('end',function(){
 					var _manifest_github = JSON.parse(data);

 					if(_versionToNumber(_manifest_github.version) > _versionToNumber(currentVersion)){			
 						if(($localStorageService.get("skip_version") == undefined || $localStorageService.get("skip_version") != _manifest_github.version || forceAlert))
 							_showUpdateWindow(_manifest_github);
 						
 					} else if (showNoUpdate) alert("No updates availables!");
 				})
 				
 			});
 		}
 	}
 	return obj;
 }]);