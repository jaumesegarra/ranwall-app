'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('wall', ['WALLPAPER_PROVIDERS', 'USER_RESOLUTION', 'WALLPAPERS_FOLDER', 'NW', 'localStorageService', 'randomString', 'win', 'UserConfig', function(_WALLPAPER_PROVIDERS, _USER_RESOLUTION, _WALLPAPERS_FOLDER, NW, $localStorageService, $randomString, $win, UserConfig) {

  var _autoSet = false;

  function _purgeWallpapersFolder(){
    try { 
      var files = NW.fs.readdirSync(_WALLPAPERS_FOLDER); 
    }catch(e) { return; }

    if (files.length > 0){
      for (var i = 0; i < files.length; i++) {
        var filePath = _WALLPAPERS_FOLDER + '/' + files[i];

        if($localStorageService.get('wallpaper_name') == undefined || files[i]!=$localStorageService.get('wallpaper_name')+'.jpeg')
          NW.fs.unlinkSync(filePath);
      }
    }
  }

  function _checkAppFolder(){       
    if(!NW.fs.existsSync(_WALLPAPERS_FOLDER)){
      if(NW.mkdirp.sync(_WALLPAPERS_FOLDER) != null){  
        return true;
      }else{
        return false;
      }
    }else{
      _purgeWallpapersFolder();
      return true;
    }
  }

  function _errorImgLoading(){
    var wall_preview = angular.element(document.querySelector("#random-wallpaper-active"));

    angular.element(document.querySelector("#random-wallpaper-active img")).removeAttr("src");

    wall_preview.removeClass('loading');
    wall_preview.addClass('error');

    setTimeout(function(){
      obj.new();
    },10000);
  }

  function _refresh_preview(){
    var wall_preview = angular.element(document.querySelector("#random-wallpaper-active > img"));
    wall_preview.attr('src', 'file:///'+_WALLPAPERS_FOLDER + '/' +obj.current_wallpaper.name+'.jpeg');

    setTimeout(function(){
      $win.autoResize();
    }, 100);
  };

  var obj = {
    current_wallpaper: {},
    prepareElement(){
      var wall_preview = angular.element(document.querySelector("#random-wallpaper-active"));
      var ranImg = document.querySelector("#random-wallpaper-active > img");
      ranImg.addEventListener("error", _errorImgLoading, false);
      ranImg.addEventListener("load", function(){
        this.style.display = 'block';
        wall_preview.removeClass('error');
        wall_preview.removeClass('loading');

        if(_autoSet)
          obj.set();
      }, false);

      ranImg.ondragstart = function() { return false; };
    },
    getAllProviders: function () {
      var p = [];

      for(var providers_index in _WALLPAPER_PROVIDERS){
        p.push(providers_index);
      }

      return p;
    },
    new: function(autoSet, notification){
      _autoSet = ((autoSet) ? true : false);

      var wall_preview = angular.element(document.querySelector("#random-wallpaper-active"));

      if(!wall_preview.hasClass("loading")){
        if(notification)
          var loading_notification = $win.create_notification("Wait a second!", "Downloading new wallpaper...");

        wall_preview.addClass('loading');

        obj.current_wallpaper.name = $randomString();

        var output = _WALLPAPERS_FOLDER + '/' + obj.current_wallpaper.name + '.jpeg';

        if(_checkAppFolder()){

          var resolution = ($localStorageService.get('user_resolution') == undefined) ? _USER_RESOLUTION : JSON.parse("["+$localStorageService.get('user_resolution')+"]");

          function getRandomProvider() {
            var wproviders = [];

            if($localStorageService.get('wall_providers') == undefined)
              wproviders = obj.getAllProviders();
            else
              wproviders = JSON.parse(localStorage.getItem('ls.wall_providers'));

            function get (wproviders){
              var number = wproviders[Math.floor(Math.random() * wproviders.length)];

              if(_WALLPAPER_PROVIDERS[number] !== undefined)
                return number;
              else{
                if(wproviders.length > 1){
                  return get(wproviders);
                }else return get(obj.getAllProviders());
              }
            }

            var wNumber = get(wproviders);

            return _WALLPAPER_PROVIDERS[wNumber];

          }

          var provider = getRandomProvider();
          obj.current_wallpaper.provider = provider.name;

          function createImage(response) {
            var file = NW.fs.createWriteStream(output);

            response.pipe(file);

            response.on('end', function(){

              function _show(){
                _refresh_preview();

                if(loading_notification)
                  loading_notification.close();
              }

              NW.jimp.read(file.path, function (err, image) {
                var width = image.bitmap.width;
                var height = image.bitmap.height;

                obj.current_wallpaper.originalResize = { width: width, height: height };
                obj.current_wallpaper.isDesiredResize = (width == resolution[0] && height == resolution[1]);

                if(!obj.current_wallpaper.isDesiredResize && UserConfig.ForceResize()){
                  image.cover(resolution[0], resolution[1]);

                  image.quality(100);
                  image.write(file.path, _show);
                }else _show();

              });

            });

            response.on('error', function(err) {
              console.error(err);
              _errorImgLoading();
            });
          }

          var url = provider.url(resolution);
          if(url instanceof Promise){
            url.then(function(url_data){
              load_url(url_data);
            });
          }else {
            load_url(url);
          }

          function load_url(url) {
            NW.https.get(url, function(response) {
              switch (provider.get.type) {
                case "json":
                var data = '';

                response.on('data', function (chunk){
                  data += chunk;
                });

                response.on('end', function(){
                  var data_res = JSON.parse(data).response;
                  var url_img = provider.get.img_path(data_res);

                  var nwhtt = NW.http;
                  if(url_img.indexOf("https://") != -1)
                    nwhtt = NW.https;

                  nwhtt.get(url_img, function(r) {
                    createImage(r);
                  });
                });

                response.on('error', function(err) {
                  console.error(err);
                  _errorImgLoading();
                });

                break;
                default:
                createImage(response);
                break;
              }
            });
          }

        }
      }
    },
    set: function(nosave){
      NW.wallpaper.set(_WALLPAPERS_FOLDER + '/' + obj.current_wallpaper.name + '.jpeg').then(() => {
        if(!nosave)
          $localStorageService.set('wallpaper_name', obj.current_wallpaper.name);
      });
    },
    saveas: function(){
      NW.dialog.setContext(document);
      NW.dialog.saveFileDialog(obj.current_wallpaper.name, '.jpeg', function(result) {
        NW.fs.createReadStream(_WALLPAPERS_FOLDER + '/' + obj.current_wallpaper.name + '.jpeg').pipe(NW.fs.createWriteStream(result));
      })
    }
  }

  return obj;
}]);
