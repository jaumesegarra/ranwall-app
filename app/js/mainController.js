'use strict';

angular.module('app')
.controller('mainController',['$scope', 'wall', 'localStorageService', 'NW', 'ConfigWindow', 'win', 'previewer', 'UserConfig', 'globalruns', function($scope, $wall, $localStorageService, NW, _ConfigWindow, $win, $previewer, _UserConfig, $globalRuns) {
	
	// Variables
	var wallPreview = ($localStorageService.get("configPreview"));
	$scope.current_wallpaper = undefined;
	$scope.isDownloading = false;
	$scope.hasError = false;

	// Initial Runs
	$globalRuns.initials(function(){ newWallpaper(true, true); });
	prepareElement();
	newWallpaper();
	checkPreview();

	WebPullToRefresh.init({
		startFunction: function (){
			disableRefresh();

			document.querySelectorAll("header > .message").forEach(e => e.parentNode.removeChild(e));
		},
		loadingFunction: function (){
			return new Promise( function( resolve, reject ) { 
				function loadNew(){
					resolve();
					newWallpaper();
					checkPreview();
				}
				
				$previewer.down().then(loadNew, loadNew);	
			})
		}
	});

	$scope.$watch(function () { return $localStorageService.get("configPreview"); },function(){
		wallPreview = ($localStorageService.get("configPreview"));
		checkPreview();
	});

	// Actions
	$scope.closeWindow = NW.win.close;
	$scope.minimizeWindow = $win.hide;
	$scope.refreshBtnClick = newWallpaper;

	$scope.setBtnClick = setWallpaper;
	$scope.saveasBtnClick = $wall.saveas;
	$scope.openConfig = $globalRuns.openConfig;

	// Functions
	function prepareElement(){

		var ranImg = document.querySelector("#random-wallpaper-active > img");
		ranImg.addEventListener("error", _errorImgLoading, false);
		ranImg.addEventListener("load", function(){
			setTimeout(function(){
				$win.autoResize();
			}, 100);
		});

		ranImg.ondragstart = function() { return false; };
	}

	function _errorImgLoading(){

		angular.element(document.querySelector("#random-wallpaper-active img")).removeAttr("src");

		$scope.isDownloading = false;
		$scope.hasError = true;

		setTimeout(function(){
			$wall.new();
		},10000);
	}

	function newWallpaper(autoset, notification){

		if(!$scope.isDownloading){
			$scope.isDownloading = true;

			$wall.new(autoset, notification).then(function() {

				$scope.hasError = false;
				$scope.isDownloading = false;

				$scope.current_wallpaper = $wall.current_wallpaper;

			}, function(){
				console.log('ERRORRRR');
			});
		}
	}

	function setWallpaper(){
		$wall.set().then(function() {
			$scope.current_wallpaper = $wall.current_wallpaper;

			clearTimeout(timeoutPreviewUp);
		});
	}

	var timeoutPreviewUp;

	var setBtnIsFocused = false;

	var previewup = function(){
		setBtnIsFocused = true;
		
		$previewer.obtainWallpaperActive().then(function(wallname){

			timeoutPreviewUp = setTimeout(function(){
				$previewer.up(wallname).then(function() {

					if(!setBtnIsFocused)
						previewdown();
				}, function(){});
			}, 620);
		}, function (err){
			if(err){
				$win.create_messageInApp('Not Found current wallpaper!', 'error');
			}
		});
	}

	var previewdown = function(){
		setBtnIsFocused = false;

		clearTimeout(timeoutPreviewUp);

		$previewer.down().then(function() {

			if(setBtnIsFocused)
				previewup();
		}, function(){});
	}

	function allowRefresh(){
		$scope.previewup = previewup;
		$scope.previewdown = previewdown;
	}

	function disableRefresh(){
		$scope.previewup = null;
		$scope.previewdown = null;
	}

	function checkPreview(){
		if(wallPreview)
			allowRefresh();
		else
			disableRefresh();
	}

}])