'use strict';

/**
 * @ngdoc function
 * @name app.wall
 * @description
 * # wall
 * Factory in the app
 */
 angular.module('app')
 .factory('win', ['NW', 'localStorageService', function(NW, $localStorageService) {
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
 		create_notification: function (title, text, onclick, onclose, autoclose) {
 			var notification = new Notification(title,{
 				/*icon: "./img/logo.png",*/
 				body: text
 			});

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
 		atLaunch: function (AppMenu) {
 			if($localStorageService.get("configHideOnStartup") == 1)
 				obj.hide();
 			else
 				obj.show();

 			NW.win.on('minimize', function() {
 				obj.hide();
 			});

 			NW.win.on('close', function() {
 				NW.gui.App.quit();
 			});

 			obj.traymenu(AppMenu);
 			obj._checkIfShowAtLaunch();
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
 			var iconbar = (process.platform == "darwin") ? "./app/img/logo_barMacos.png" : "./app/img/logo_barWin.png";

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

 			if (process.platform == "darwin") {
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

 			if (process.platform == "darwin") {
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