'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
angular.module('app')
  .factory('wall', ['URL_RANDOM_WALLPAPERS', 'WALLPAPER_NAME', 'WALLPAPERS_FOLDER', 'NW', 'localStorageService', 'randomString', function(_URL_RANDOM_WALLPAPERS,  _WALLPAPER_NAME, _WALLPAPERS_FOLDER, NW, $localStorageService, $randomString) {
          var obj = {
            refresh_preview: function(){
                var wall_preview = angular.element(document.querySelector("#random-wallpaper-active > img"));
                wall_preview.attr('src', 'file:///'+_WALLPAPERS_FOLDER + '/' +_WALLPAPER_NAME+'.jpeg');
            },
            _purgeWallpapersFolder: function(){
                try { 
                    var files = NW.fs.readdirSync(_WALLPAPERS_FOLDER); 
                }catch(e) { return; }
                
                if (files.length > 0)
                    for (var i = 0; i < files.length; i++) {
                        var filePath = _WALLPAPERS_FOLDER + '/' + files[i];

                        if($localStorageService.get('wallpaper_name') == undefined || files[i]!=$localStorageService.get('wallpaper_name')+'.jpeg')
                            NW.fs.unlinkSync(filePath);
                    }
            },
            _checkAppFolder: function(){            
                if(!NW.fs.existsSync(_WALLPAPERS_FOLDER)){
                    if(NW.mkdirp.sync(_WALLPAPERS_FOLDER) != null){  
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    obj._purgeWallpapersFolder();
                    return true;
                }
            },
            new: function(){   
              
              var wall_preview = angular.element(document.querySelector("#random-wallpaper-active"));
                  wall_preview.addClass('loading');

              var refresh_button = angular.element(document.querySelector("#refresh-random-wallpaper"));
                  refresh_button.attr("disabled", "disabled");

              _WALLPAPER_NAME = $randomString();

              var output = _WALLPAPERS_FOLDER + '/' + _WALLPAPER_NAME + '.jpeg';
               
              if(obj._checkAppFolder()){
                  var file = NW.fs.createWriteStream(output);

                  var request = NW.http.get(_URL_RANDOM_WALLPAPERS, function(response) {
                      response.pipe(file);

                      response.on('end', function(){
                          $localStorageService.set('ran_set', true);
                          
                          var refresh_button = angular.element(document.querySelector("#refresh-random-wallpaper"));
                              refresh_button.removeAttr("disabled");

                          obj.refresh_preview();
                          
                          var wall_preview = angular.element(document.querySelector("#random-wallpaper-active"));
                          wall_preview.removeClass('loading');
                      });
                  });
              }
            },
            set: function(){
                NW.wallpaper.set(_WALLPAPERS_FOLDER + '/' + _WALLPAPER_NAME + '.jpeg').then(() => {
                    $localStorageService.set('wallpaper_name', _WALLPAPER_NAME);
                });
            }
          }
          return obj;
        }]);
