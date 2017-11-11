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