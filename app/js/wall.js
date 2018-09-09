'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('wall', ['$q', 'WALLPAPER_PROVIDERS', 'USER_RESOLUTION', 'WALLPAPERS_FOLDER', 'NW', 'localStorageService', 'randomString', 'win', 'UserConfig', function($q, _WALLPAPER_PROVIDERS, _USER_RESOLUTION, _WALLPAPERS_FOLDER, NW, $localStorageService, $randomString, $win, UserConfig) {

  var _autoSet = false;

  /**
   * Delete unused wallpapers of the app folder
   * @return {[type]} [description]
   */
  function _purgeWallpapersFolder(){
    return $q(function (resolve, reject){
      NW.fs.readdir(_WALLPAPERS_FOLDER, function(err, files){ // Obtain name of the folder files
        if(err){
          console.error(err);
          return reject();
        }

        if (files.length > 0){
          let deleted = 0; // num of files deleted (iterator)

          for (var i = 0; i < files.length; i++) { // Delete one to one files except current wallpaper (if there are one)
            var filePath = _WALLPAPERS_FOLDER + '/' + files[i]; // Full path of the file

            if($localStorageService.get('wallpaper_name') == undefined || files[i]!=$localStorageService.get('wallpaper_name')+'.jpeg') // if it isn't the current wallpaper
              NW.fs.unlink(filePath, function(err){ // delete the file
                if(err){
                  console.error(err);
                }

                deleted++; // increment deleted files
                check_all_deleted(deleted, files.length); // check if all the files are deleted
              }); 
            else{
              deleted++; // increment deleted files
              check_all_deleted(deleted, files.length); // check if all the files are deleted
            }

          }
        }else resolve(); // if no files on the folder: finalize the promise

        function check_all_deleted(deleted, num_files){

            if(deleted == num_files)
              resolve();
        }
      });

    });
  }

  /**
   * Prepare wallpapers folder to download a new
   * @return {Promise} When the preparation is finished
   */
  function _checkAppFolder(){
    return $q(function(resolve, reject){
      if(!NW.fs.existsSync(_WALLPAPERS_FOLDER)){ // Check folder exists

        NW.mkdirp(_WALLPAPERS_FOLDER, function (err) { // Create folder
          if (err) {
            reject();
            console.error(err);
          }

          resolve();
        });
      }else { // if exists
        _purgeWallpapersFolder().then(resolve, reject); // delete unused wallpapers
      }
    });
  }

  /**
   * Get desired Wallpaper resolution (via localstorage [if user defined in settings] or the default)
   * @return {width, height}
   */
  function _userDesiredWallpaperSize(){
    var ur = $localStorageService.get('user_resolution'); // Obtain from localstorage

    return (!ur) ? _USER_RESOLUTION : JSON.parse("["+ur+"]"); // if not in localstorage; get the default from the screen
  }

  /**
   * Obtain wallpaper data of a future new wallpaper
   * @return {Object}
   */
  function Wallpaper(){
    return {
      name: $randomString(), // Get a random filename for saving
      output: function (){ // Utility for obtain full path of the wallpaper
        return _WALLPAPERS_FOLDER + '/' + this.name + '.jpeg';
      },
      provider: obj.getRandomProvider(), // Get a random provider for download wallpaper
      status: -1,
      originalResize: { // Resolution of the image (writable)
        width: 0,
        height: 0
      },
      isDesiredResize: function(){ // Utility for check if the image has the desired resolution
        var desiredSize = _userDesiredWallpaperSize();

        return (this.originalResize.width == desiredSize[0] && this.originalResize.height == desiredSize[1]);
      }
    };
  }

  /**
   * Download a image with the Wallpaper data
   * @param  {Wallpaper} wallpaper_data
   * @return {Promise} When image has been download (returns a binary image)
   */
  function _downloadWallpaper(wallpaper_data){ 

    return $q(function (resolve, reject) {

      var provider = wallpaper_data.provider; // Wallpaper provider

      // Function to download image by url
      function load_url(url) {

        NW.https.get(url, function(response) { // download site url 

          switch (provider.get.type) { // if provider returns a json with data image
            case "json":
            var data = ''; // variable for save site response

            response.on('data', function (chunk){ // collect the response
              data += chunk;
            });

            response.on('end', function(){ // when response collected

              var data_res = JSON.parse(data).response; // convert to object
              var url_img = provider.get.img_path(data_res); // get image url from the site response

              // Use http or http for download the image?
              var nwhtt = NW.http;
              if(url_img.indexOf("https://") != -1)
                nwhtt = NW.https;

              // Download image
              nwhtt.get(url_img, function(r) {
                resolve(r);
              });
            });

            response.on('error', function(err) {
              console.error(err);
              reject();
            });

            break;
            default: // if provider returns the image
              resolve(response);
            break;
          }
        });
      }

      var url = provider.url(_userDesiredWallpaperSize()); // Get wallpaper url
      if(url instanceof Promise){ // If provider needs time for obtain url
        url.then(function(url_data){ // wait
          load_url(url_data); 
        });
      }else load_url(url); // Download image
    })
  }

  /**
   * Save the wallpaper on the folder and resize (if image needs and user wants)
   * @param  {Wallpaper} wallpaper_data 
   * @param  {Binary file} binary_image
   * @return {Promise} When image has been saved and resized.
   */
  function _saveAndResizeWallpaper(wallpaper_data, binary_image){ 
    return $q(function (resolve, reject) {

      var file = NW.fs.createWriteStream(wallpaper_data.output()); // Open a new file

      binary_image.pipe(file); // save binary image in to file

      binary_image.on('end', function(){ // when image has been saved

        NW.jimp.read(file.path, function (err, image) { // read file for check the resolution and resizing (optional)
          // Image resolution
          var width = image.bitmap.width;
          var height = image.bitmap.height;

          wallpaper_data.originalResize = { width: width, height: height }; // save in wallpaper data

          if(!wallpaper_data.isDesiredResize() && UserConfig.ForceResize()){ // If image resolution isn't the desired and user wants change it:
            var desiredSize = _userDesiredWallpaperSize(); // obtain desired resolution

            image.cover(desiredSize[0], desiredSize[1]); // update resolution of the image

            // save changes on the image
            image.quality(100);
            image.write(file.path, resolve);

          }else resolve(); // or finish already
        });

      });

      binary_image.on('error', function(err) {
        console.error(err);
        reject();
      });
    });
  }

  var obj = {
    current_wallpaper: {},
    getAllProviders: function () {
      var p = [];

      for(var providers_index in _WALLPAPER_PROVIDERS){
        p.push(providers_index);
      }

      return p;
    },
    getRandomProvider() {
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
    },
    new: function(autoSet, notification){
      _autoSet = ((autoSet) ? true : false);

        if(notification)
          var loading_notification = $win.create_notification("Wait a second!", "Downloading new wallpaper...");

        return $q(function(resolve, reject){
          _checkAppFolder().then(function () {
            var wallpaper_info = Wallpaper();

            _downloadWallpaper(wallpaper_info).then(function(data){

              _saveAndResizeWallpaper(wallpaper_info, data).then(function(){

                function finished(){
                  if(loading_notification)
                    loading_notification.close();

                  obj.current_wallpaper = wallpaper_info;

                  resolve();
                }

                if(_autoSet)
                  obj.set().then(finished);
                else finished();

              }, reject);
            }, reject);
          }, reject);
        });

    },
    set: function(nosave){
      return $q(function(resolve, reject){
        NW.wallpaper.set(_WALLPAPERS_FOLDER + '/' + obj.current_wallpaper.name + '.jpeg').then(() => {
          resolve();

          if(!nosave){
            $localStorageService.set('wallpaper_name', obj.current_wallpaper.name);
            obj.current_wallpaper.status = 1;
          }
        }, reject);
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
