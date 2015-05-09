// ==UserScript==
// @name        UniWorX
// @namespace   de.fischeversenker.uniworx
// @description Adds custom Navigation for Uniworx
// @include     https://uniworx.ifi.lmu.de/*
// @version     0.2
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true); // avoiding conflicts with uniworx' jquery

var uniworx = function($){
	
	// ---------------------------------------------------------
	// Definitionen
	// ---------------------------------------------------------

	// Hier weitere Kurse eintragen:
	var knownCourses = {
				371: {
					title: "Algorithmen und Datenstrukturen",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
				391: {
					title: "Medientechnik (Praktikum)",
					actions: ["abgaben"],
				},
				381: {
					title: "Medientechnik (Vorlesung)",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
				398: {
					title: "Programmierung und Modellierung",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
				380: {
					title: "Rechnerarchitektur",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
	};
	// ... bis hier.
	
	var knownActions = {
				abgaben: {
					action: "uniworxSheetListUser",
					title: "Abgaben",
				},
				gruppen: {
					action: "uniworxExercisegroupListStudent",
					title: "Übungsgruppen",
				},
				klausuren: {
					action: "uniworxExamListUser",
					title: "Klausuren",
				},
	};

	var backgroundActiveItem = $(".navButton").css("background-color");
	
	// ---------------------------------------------------------
	// Pseudo Static Class uniworxController
	// ---------------------------------------------------------

	var uniworxController = {
		
		getMenuItemsFromDom: function(){
			var menuItems = [];
			var $mI = $("#menu h2.inactive:not(.semester):not(.old)");
			$.each($mI, function(i){
				var $mIa = $(this).find('a');
				var course = urlAdapter.getCourseFromUrl($mIa.attr("href"));
				var mI = {
					domEle: this,
					course: course,
					actions: uniworxController.getActionsForCourse(course),
					title: $mIa[0].text,
				}
				menuItems.push(mI);
			});
			return menuItems;
		},
		
		getMenuItemDom: function(menuItem){
			var $ul = $("<ul/>");
			$.each(menuItem.actions, function(i){
				var $mI = $("<li/>");
				$mI.append("<a href='"+urlAdapter.getActionUrl(this.action, menuItem.course)+"'>"+this.title+"</a>").appendTo($ul);
			});
			return $ul;
		},
		
		getActionsForCourse: function(course){
			var actions = [];
			if(knownCourses[course] != null){
				$.each(knownCourses[course].actions, function(i){
					if(knownActions[this] != null){
						actions.push(knownActions[this]);
					}
				});
			}
			return actions;
		},
		
		beautifyNavi: function(){
			var $activeItems = $("#menu h2:not(.semester):not(.old)");
			$.each($activeItems, function(i){
				var as = $(this).find("a[href$=\""+urlAdapter.getCourseFromUrl(window.location.href)+"\"]");
				if(as.length > 0){
					$($activeItems[i]).css({backgroundColor: backgroundActiveItem, borderRight: "5px solid black"});
					$($activeItems[i].nextSibling).css({backgroundColor: backgroundActiveItem, borderRight: "5px solid black"});
				}
			});
		},
		
		magic: function(){
			console.log("making the magic happen...");
			var menuItems = uniworxController.getMenuItemsFromDom();
			$.each(menuItems, function(i){
				$(this.domEle).after(uniworxController.getMenuItemDom(this));
			});
			uniworxController.beautifyNavi();
		},
	}

	// ---------------------------------------------------------
	// Pseudo Static Class urlAdapter
	// ---------------------------------------------------------

	var urlAdapter = {
		
		getCourseFromUrl: function(url){
			var currId = -1;
			var idFromUrl = url.match(/&id=([\d]+)/);
			if(idFromUrl != null){
				var currId = idFromUrl[1];
			}
			return currId;
		},
		
		getActionUrl: function(action, id){
			var url = "/?action=" + action;
			if(parseInt(id) > 0){
				url += "&id=" + id;
			}
			return url;
		},
	}
	
	uniworxController.magic();

};

// For x-Browser jQuery SUPPORT 
// Kudos to Brock Adams, http://stackoverflow.com/questions/2246901/how-can-i-use-jquery-in-greasemonkey-scripts-in-google-chrome/12751531#12751531

function add_jQuery (callbackFn, jqVersion) {
		var jqVersion   = jqVersion || "1.7.2";
		var targ        = document.getElementsByTagName ('head')[0] || document.body || document.documentElement;
		var scriptNode  = document.createElement ('script');
		scriptNode.src  = '//ajax.googleapis.com/ajax/libs/jquery/' + jqVersion + '/jquery.min.js';
		scriptNode.addEventListener ("load", function () {
				var scriptNode          = document.createElement ("script");
				scriptNode.textContent  =
						'var gm_jQuery  = jQuery.noConflict (true);\n'
						+ '(' + callbackFn.toString () + ')(gm_jQuery);'
				;
				targ.appendChild (scriptNode);
		}, false);
		targ.appendChild (scriptNode);
}


if (typeof jQuery === "function") {
	uniworx(jQuery);
}	else {
	add_jQuery (uniworx, "1.7.2");
}
