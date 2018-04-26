// ==UserScript==
// @name        UniWorX
// @namespace   de.fischeversenker.uniworx
// @description Enhanced navigation for UniWorX
// @include     https://uniworx.ifi.lmu.de/*
// @version     1.0.9
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
        			464: {
			                title: "Systempraktikum",
			                actions: ["gruppen"],
			        },
			        449: {
				        title: "Betriebssysteme",
				        actions: ["gruppen", "abgaben", "klausuren"],
			        },
			        516: {
			        	title: "Theoretische Informatik für Medieninformatiker",
			        	actions: ["abgaben", "klausuren"],
			        },
			        551: {
			        	title: "Rechnernetze und verteilte Systeme",
			        	actions: ["gruppen", "abgaben", "klausuren"],
			        },
			        533: {
			        	title: "Algorithmen und Datenstrukturen",
			        	actions: ["gruppen", "abgaben", "klausuren"],
			        },
			        556: {
			        	title: "Computergrafik I",
			        	actions: ["gruppen", "abgaben", "klausuren"],
			        },
			        588: {
			        	title: "Juristisches IT-Projektmanagement",
			        	actions: ["klausuren"],
			        },
				624: {
					title: "Praktikum Entwicklung Mediensysteme",
					actions: ["abgaben"],
				},
				587: {
					title: "Softwaretechnik",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
				616: {
					title: "Datenbanksysteme I",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
				696: {
					title: "Vorlesung Multimedia-Programmierung",
					actions: ["gruppen", "abgaben", "klausuren"],
				},
				718: {
					title: "Interaction Design",
					actions: ["abgaben", "klausuren"],
				},
				726: {
					title: "Human Factors in Engineering",
					actions: ["klausuren"]
				},
				751: {
					title: 'Bachelor-Seminar "Web Technologies"',
					actions: ['klausuren']
				},
				814: {
					title: 'Blockpraktikum User Experience Design III - (Concept Development)',
					actions: ['abgaben', 'klausuren']
				},
				805: {
					title: 'Kurs Zeichnen und Skizzieren von Szenarien',
					actions: ['klausuren', 'gruppen']
				},
				867: {
					title: '[ZP] Praktikum Web Programmierung',
					actions: ['abgaben', 'klausuren']
				},
				897: {
					title: '[PSY] Grundbegriffe der Psychologie für Medieninformatiker',
					actions: ['klausuren']
				}
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
			          	dataType: "text",
			          	success: function(d) {
                                		d = d.replace(/(^<\?xml(?:.|\n|\f|\s|\r)*?<body>)/, '').replace(/(<\/body>.*)/, ''); // remove everything outside of <body>
                                		var $td = $(d);
		              			$td = $td.find("#content .realtable.sortable").find("tbody td:first-child");
		              			var spans = $td.find("span");
		        			if(spans.length > 0) {
		                  			var span = $(spans).get(1);
		                  			$(span).css({"font-size":"1em", "font-weight":"bold", "font-family": "Helvetica, Arial, Verdana, sans-serif", "float": "right"}).insertBefore(element[0].parentElement.parentElement);
		              			}
		          		},
		          		error: function(a,b,c) {
		            			console.log("error", a);
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
