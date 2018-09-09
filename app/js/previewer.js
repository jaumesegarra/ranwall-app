'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('previewer', ['$q', 'NW', 'wall', 'win', function($q, NW, $wall, $win) {
 	var _currentThinking = false,
 	_wallpaperActive = null,
 	_errorShowed = false;

 	var obj = {
 		isActive: false,
 		obtainWallpaperActive: function(){
 			return $q(function (resolve, reject){	

 				var not_same_wallpaper = function() {
 					return $wall.current_wallpaper.name != JSON.parse(localStorage.getItem("ls.wallpaper_name"));
 				} 

 				if($win.isFocused && not_same_wallpaper && !obj.isActive){
 					obj.isActive = true;

 					NW.wallpaper.get().then(imagePath => {
 						
 						if(NW.fs.existsSync(imagePath)){
 							resolve(imagePath);
 						} else { 
 							var showErr = undefined;

 							if(!_errorShowed && not_same_wallpaper){
 								showErr = true;
 								_errorShowed = true;
 							}

 							reject(showErr);
 						}
 					}, reject);
 				}else reject();
 			});
 		},
 		up: function(imagePath){
 			return $q(function (resolve, reject){

 				if(!_currentThinking){
 					_currentThinking = true;

 					obj.isActive = true;

 					_wallpaperActive = imagePath;

 					$wall.set(true).then(function() { _currentThinking = false; $wall.current_wallpaper.status = 0; resolve(); }, function() { _currentThinking = false; reject(); });
 				}else reject();
 			});
 		},
 		down: function(){
 			return $q(function (resolve, reject){

 					obj.isActive = false;

 					if($wall.current_wallpaper.name != JSON.parse(localStorage.getItem("ls.wallpaper_name")))
 						obj.restore().then(resolve, reject);
 					else resolve();
 			});
 		},
 		restore: function(){
 			return $q(function (resolve, reject){
 				if(_wallpaperActive && _wallpaperActive != "")
 					NW.wallpaper.set(_wallpaperActive).then(() => {
 						_wallpaperActive = null;
 						$wall.current_wallpaper.status = -1;
 						resolve();
 					}, reject);
 				else resolve();
 			});	
 		}
 	}

 	return obj;
 }]);