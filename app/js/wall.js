'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('wall', ['WALLPAPER_PROVIDERS', 'USER_RESOLUTION', 'WALLPAPER_NAME', 'WALLPAPERS_FOLDER', 'NW', 'localStorageService', 'randomString', 'win', function(_WALLPAPER_PROVIDERS, _USER_RESOLUTION,  _WALLPAPER_NAME, _WALLPAPERS_FOLDER, NW, $localStorageService, $randomString, $win) {
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
      new: function(autoSet, notification){   
        var wall_preview = angular.element(document.querySelector("#random-wallpaper-active"));

        if(!wall_preview.hasClass("loading")){
          if(notification)
            var loading_notification = $win.create_notification("Wait a second!", "Downloading new wallpaper...");

          wall_preview.addClass('loading');

          function evLoadIMG(){
            this.style.display = 'block';
            wall_preview.removeClass('error');
            wall_preview.removeClass('loading');

            if(autoSet)
              obj.set();
          }

          document.querySelector("#random-wallpaper-active > img").removeEventListener("load", evLoadIMG, false);

          document.querySelector("#random-wallpaper-active > img").addEventListener("load", evLoadIMG, false);


          _WALLPAPER_NAME = $randomString();

          var output = _WALLPAPERS_FOLDER + '/' + _WALLPAPER_NAME + '.jpeg';

          if(obj._checkAppFolder()){
            var file = NW.fs.createWriteStream(output);

            var resolution = ($localStorageService.get('user_resolution') == undefined) ? _USER_RESOLUTION : JSON.parse("["+$localStorageService.get('user_resolution')+"]");
            
            function getRandomProvider() {            
              return _WALLPAPER_PROVIDERS[Math.floor(Math.random() * _WALLPAPER_PROVIDERS.length)];
            }

            var provider = ($localStorageService.get('wall_provider') == undefined) ? getRandomProvider() : ((parseInt($localStorageService.get('wall_provider')) == -1) ? getRandomProvider() : _WALLPAPER_PROVIDERS[parseInt($localStorageService.get('wall_provider'))]);
            var url = provider.url.replace("{x}",resolution[0]).replace("{y}",resolution[1]);
            
            function createImage(response) {
              response.pipe(file);

              response.on('end', function(){

                obj.refresh_preview();

                if(loading_notification)
                  loading_notification.close();
              });
            }

            var request = NW.https.get(url, function(response) {
              switch (provider.get.type) {
                case "json":
                break;
                default:
                createImage(response);
                break;
              }
            });
          }
        }
      },
      set: function(){
        NW.wallpaper.set(_WALLPAPERS_FOLDER + '/' + _WALLPAPER_NAME + '.jpeg').then(() => {
          $localStorageService.set('wallpaper_name', _WALLPAPER_NAME);
        });
      },
      saveas: function(){
        NW.dialog.setContext(document);
        NW.dialog.saveFileDialog(_WALLPAPER_NAME, '.jpeg', function(result) {
          NW.fs.createReadStream(_WALLPAPERS_FOLDER + '/' + _WALLPAPER_NAME + '.jpeg').pipe(NW.fs.createWriteStream(result));
        })
      }
    }
    return obj;
  }]);
