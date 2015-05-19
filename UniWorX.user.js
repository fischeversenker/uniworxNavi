// ==UserScript==
// @name        UniWorX
// @namespace   de.fischeversenker.uniworx
// @description Enhanced navigation for UniWorX
// @include     https://uniworx.ifi.lmu.de/*
// @version     0.6
// @grant       unsafeWindow
// @require     //ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

// to avoid conflicts with Tampermonkey
this.$ = this.jQuery = jQuery.noConflict(true);

// Revealing Module UniWorXNavi
var UniWorXNavi = (function($){
	
	// ---------------------------------------------------------
	// Definitions
	// ---------------------------------------------------------

	// Add Course-IDs here:
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
				389: {
					title: "Arbeitskreis Digitalfotografie",
					actions: ["none"],
				},
	};
	// ... .
	
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
				none: {
					action: "uniworxCourseSelect",
					title: "<em>Keine weiteren Optionen</em>",
				},
	};

	var backgroundColorActiveItem = $(".navButton").css("background-color");
	
  	function stripPrecedingSlash(str) {
		if(str.substr(0,1) == '/') {
      			return str.substr(1);
    		}
    		return str;
  	}
  	
	// ---------------------------------------------------------
	// Pseudo Static Class uniworxController
	// ---------------------------------------------------------

	var uniworxController = {
		
		// returns present menu items from navigation sidebar
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
    

    
	    	showStatistics: function() {
		        $("#menu a[href*="+knownActions.abgaben.action+"]:first-child").each(function(index, element) {
			        element = $(element);
			        $.ajax({
			          	url: "https://uniworx.ifi.lmu.de/" + stripPrecedingSlash(element.attr("href")),
			          	type: "GET",
			          	dataType: "html",
			          	success: function(d) {
		              			var $td = $($($($(d).get(37)).find("#content .realtable.sortable").get(0)).find("tbody td:first-child")); // 37 sehr vage! Unbedingt anpassen!
		              			var spans = $td.find("span");
		        			if(spans.length > 0) {
		                  			var span = $(spans).get(1);
		                  			$(span).css({"font-size":"1em", "font-weight":"bold", "font-family": "Helvetica, Arial, Verdana, sans-serif", "padding-left":"140px"}).insertBefore(element[0].parentElement.parentElement);
		              			}
		          		},
		          		error: function(a,b,c) {
		            			console.log(a);
		          		},
		        	});
	      		});
	    	},
		
		// returns DOM element representing menuItem-Obejct
		getMenuItemDom: function(menuItem){
			var $ul = $("<ul/>");
			$.each(menuItem.actions, function(i){
				var $mI = $("<li/>");
				$mI.append("<a href='"+urlAdapter.getActionUrl(this.action, menuItem.course)+"'>"+this.title+"</a>").appendTo($ul);
			});
			return $ul;
		},
		
		// returns known actions for known course
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
		
		// adds visual feedback of selected course to navigation sidebar
		beautifyNavi: function(){
			var $activeItems = $("#menu h2:not(.semester):not(.old)");
			$.each($activeItems, function(i){
				var as = $(this).find("a[href$=\""+urlAdapter.getCourseFromUrl(window.location.href)+"\"]");
				if(as.length > 0){
					$($activeItems[i]).css({backgroundColor: backgroundColorActiveItem, borderRight: "5px solid #888"});
					$($activeItems[i].nextSibling).css({backgroundColor: backgroundColorActiveItem, borderRight: "5px solid #888"});
				}
			});
		},
		
		// starting point
		magic: function(){
			var menuItems = uniworxController.getMenuItemsFromDom();
			$.each(menuItems, function(i){
				$(this.domEle).after(uniworxController.getMenuItemDom(this));
			});
			uniworxController.beautifyNavi();
      			uniworxController.showStatistics();
		},
	};

	// ---------------------------------------------------------
	// Pseudo Static Class urlAdapter
	// ---------------------------------------------------------

	var urlAdapter = {
		
		// returns id of selected course if any. Otherwise -1 
		getCourseFromUrl: function(url){
			var currId = -1;
			var idFromUrl = url.match(/&id=([\d]+)/);
			if(idFromUrl != null){
				var currId = idFromUrl[1];
			}
			return currId;
		},
		
		// returns url for given action and id
		getActionUrl: function(action, id){
			var url = "/?action=" + action;
			if(parseInt(id) > 0){
				url += "&id=" + id;
			}
			return url;
		},
	};
	
	return {magic: uniworxController.magic};

})(jQuery);

// calling the module on jQuery's DomReady
jQuery(function(){
	UniWorXNavi.magic();
});
