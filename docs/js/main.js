document.querySelector("#app-template img").ondragstart = function() { return false; };

var stickyHeader = document.getElementsByTagName('header')[0];
var styckyDiv = document.querySelector(".waller");

window.onscroll = function(e) {
	var bodyScrollTop = e.pageY || document.documentElement.scrollTop || document.body.scrollTop;

	if (bodyScrollTop > styckyDiv.clientHeight) {
		document.body.classList.add("no-fixed-waller");
		stickyHeader.classList.add('fixed');
	} else {
		document.body.classList.remove("no-fixed-waller");
		stickyHeader.classList.remove('fixed');
	}
};

$("a[href^='#']").on("click", function(e){
	e.preventDefault();

	var content = this.getAttribute("href");
	var scrollPos = 0;

	if(content != "#")
		scrollPos = $(content).offset().top;

	$('html, body').animate({ scrollTop: scrollPos }, 'slow');
});

function wallLoading(yes){
	if(yes){
		$("#app-template").addClass("loading");
		$("#app-template img").attr("src", "img/screnshoot_loading.png");
	}else {
		$("#app-template").removeClass("loading");
		$("#app-template img").attr("src", "img/screnshoot.png");
	}
}

var walls_urls = ["142","242","450", "472", "562", "588", "829"];

function loadWallpaper(){
	wallLoading(true);

	var wall = new Image();
	var rand = walls_urls[Math.floor(Math.random() * walls_urls.length)];

	$(".waller").css('background-image', 'url(img/walls/'+rand+'.jpg)');
	wall.src = "img/walls/"+rand+".jpg";

	wall.addEventListener("load", function(){
		$(".waller").css('background-image', 'url('+wall.src+')');
		wallLoading(false);
	},false);

	wall.addEventListener("error", function(){
		loadWallpaper();
	}, false)
}

loadWallpaper();