'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('previewer', ['NW', 'wall', 'win', function(NW, $wall, $win) {
 	var _imgElement = angular.element(document.querySelector("#random-wallpaper-active img")),
 	_wallpaperActive = null,
 	_errorShowed = false;

 	var obj = {
 		isActive: false,
 		up: function(){
 			if($win.isFocused && $wall.current_wallpaper.name != JSON.parse(localStorage.getItem("ls.wallpaper_name")) && !obj.isActive){
 				NW.wallpaper.get().then(imagePath => {
 					if(NW.fs.existsSync(imagePath)){
 						obj.isActive = true;
 						_imgElement.addClass('preview');

 						_wallpaperActive = imagePath;

 						console.log('aaaaa');
 						
 						$wall.set(true);
 					}else{
 						console.error('404, Not Found current wallpaper!');
 						
 						if(!_errorShowed){
 							$win.create_messageInApp('Not Found current wallpaper!', 'error');
 							_errorShowed = true;
 						}
 					}
 				});
 			}
 		},
 		down: function(){
 			obj.isActive = false;
 			_imgElement.removeClass('preview');

 			if($wall.current_wallpaper.name != JSON.parse(localStorage.getItem("ls.wallpaper_name")))
 				obj.restore();
 			
 		},
 		restore: function(){
 			if(_wallpaperActive != ""){
 				NW.wallpaper.set(_wallpaperActive).then(() => {
 					_wallpaperActive = null;
 				});
 			}
 		}
 	}

 	return obj;
 }]);