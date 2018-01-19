'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('win', ['NW', 'PLATFORM', 'localStorageService', function(NW, _PLATFORM, $localStorageService) {
 	var obj = {
 		statusShow: false,
 		command: function (command, func) {
 			var gui = NW.gui;

 			var option = {
 				key : command,
 				active : function() {
 					func();
 				},
 				failed : function(msg) {
 					console.log(msg);
 				}
 			};

 			var shortcut = new gui.Shortcut(option);
 			gui.App.registerGlobalHotKey(shortcut);
 		},
 		create_messageInApp:function (text, type){
 			var $header = angular.element(document.querySelector("header"));

 			var $badge = angular.element(document.createElement("div"));
 			$badge.addClass('message');
 			$badge.addClass(type);

 			var $text = angular.element(document.createElement('div'));
 			$text.text(text);

 			$badge.append($text);

 			$header.append($badge);
 		},
 		create_notification: function (title, text, onclick, onclose, autoclose) {
 			var ndata = {
 				body:text
 			};

 			if(_PLATFORM != "mac")
 				ndata.icon = "./img/logo.png";

 			var notification = new Notification(title, ndata);

 			notification.onclick = function () {
 				notification.close();

 				if(onclose !== undefined)
 					onclose();
 				

 				if(onclick !== undefined)
 					onclick();
 			}

 			notification.onshow = function () {
 				if(autoclose)
 					setTimeout(function() {
 						notification.close(); 

 						if(onclose !== undefined)
 							onclose()
 					}, 6000);
 			}

 			return notification;
 		},
 		_preventNoPreviewed: function(){
 			var imgElement= angular.element(document.querySelector("#random-wallpaper-active img"));
 			if(imgElement.hasClass("preview")){
 				imgElement.triggerHandler("mouseout");
 			}
 		},
 		isFocused: false,
 		atLaunch: function (AppMenu) {
 			if($localStorageService.get("configHideOnStartup") == 1)
 				obj.hide();
 			else
 				obj.show();

 			NW.win.on('focus', function(){
 				obj.isFocused = true;
 			});

 			NW.win.on('blur', function() {
 				obj.isFocused = false;
 				obj._preventNoPreviewed();
 			});

 			NW.win.on('minimize', function() {
 				obj.hide(true);
 			});

 			NW.win.on('close', function() {
 				obj._preventNoPreviewed();

 				NW.gui.App.quit();
 			});

 			obj.traymenu(AppMenu);
 			obj._checkIfShowAtLaunch();
 		},
 		autoResize: function (){
 			var window_ = NW.gui.Window.get();
 			var app_ = document.querySelector("body");

 			window_.width = app_.clientWidth;
 			window_.height = app_.clientHeight;
 		},
 		toggleShow: function () {
 			if(obj.statusShow)
 				obj.hide(true);
 			else 
 				obj.show();
 		},
 		show: function() {
 			NW.win.setShowInTaskbar(true);
 			NW.win.show();
 			obj.statusShow = true;

 			if(obj._hideNotification){
 				obj._hideNotification.close();
 				obj._hideNotification = undefined;
 			}
 		},
 		_hideNotification: undefined,
 		hide: function(showNotification){
 			NW.win.hide();
 			NW.win.setShowInTaskbar(false);
 			obj.statusShow = false;

 			if(showNotification && !obj._hideNotification){
 				obj._hideNotification = obj.create_notification("App is hide!", "This app is hide, click to show!", function(){obj.show();}, function(){ obj._hideNotificationOpen = undefined; }, true);
 			}
 		},
 		traymenu: function(AppMenu){
 			var iconbar = (_PLATFORM == "mac") ? "./app/img/logo_barMacos.png" : "./app/img/logo_barWin.png";

 			var tray = new NW.gui.Tray({icon: iconbar });
 			tray.on("click", function(){
 				obj.toggleShow();
 			});

 			var menu = new NW.gui.Menu();

 			AppMenu.forEach(function(element) {
 				if(element.separator){
 					menu.append(new NW.gui.MenuItem({ type: 'separator' }));
 				}else {
 					var data = {'label': element.name}
 					if(element.key && element.modifiers){
 						data.key = element.key;
 						data.modifiers = element.modifiers.replace("+", "-")
 					}
 					var item = new NW.gui.MenuItem(data);
 					item.click = function(){
 						element.click();
 					};
 					menu.append(item);
 				}
 			});

 			tray.menu = menu;
 		},
 		_checkIfShowAtLaunch : function(){
 			var stPath = process.execPath;

 			if (_PLATFORM == "mac") {
 				stPath = stPath.split("/Contents/");
 				stPath = stPath[0];
 			}

 			var ranwallAutoLauncher = new NW.autoLaunch({
 				name: 'ranwall',
 				path: stPath,
 				isHidden: true
 			});

 			ranwallAutoLauncher.isEnabled().then(function(isEnabled){
 				$localStorageService.set("configLaunchAtStartup", (isEnabled) ? 1 : 0);
 			})
 		},
 		launchAtStartup : function(isEnabled){
 			var stPath = process.execPath;

 			if (_PLATFORM == "mac") {
 				stPath = stPath.split("/Contents/");
 				stPath = stPath[0];
 			}

 			var ranwallAutoLauncher = new NW.autoLaunch({
 				name: 'ranwall',
 				path: stPath,
 				isHidden: true
 			});

 			if(isEnabled){
 				ranwallAutoLauncher.enable();
 				$localStorageService.set("configLaunchAtStartup", 1);
 			}else{
 				ranwallAutoLauncher.disable(); 
 				$localStorageService.set("configLaunchAtStartup", 0);
 			}
 		},
 		hideOnStartup : function(isEnabled){
 			if(isEnabled)
 				$localStorageService.set("configHideOnStartup", 1);
 			else
 				$localStorageService.set("configHideOnStartup", 0);
 		}
 	};

 	return obj;
 }]);