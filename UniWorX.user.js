// ==UserScript==
// @name        UniWorX
// @namespace   de.fischeversenker.uniworx
// @description Enhanced navigation for UniWorX
// @include     https://uniworx.ifi.lmu.de/*
// @version     0.4
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

  var uniworx = function($){
		
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
		};

		var backgroundActiveItem = $(".navButton").css("background-color");
		
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
						$($activeItems[i]).css({backgroundColor: backgroundActiveItem, borderRight: "5px solid #888"});
						$($activeItems[i].nextSibling).css({backgroundColor: backgroundActiveItem, borderRight: "5px solid #888"});
					}
				});
			},
			
			// starting point
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
		}
		
		uniworxController.magic();

	};

	// for x-Browser jQuery SUPPORT 
	// Kudos to Brock Adams: http://bit.ly/1DZ934D

	function add_jQuery (callbackFn, jqVersion) {
			var jqVersion   = jqVersion || "1.7.2";
			var targ        = document.getElementsByTagName ('head')[0] || document.body || document.documentElement;
			var scriptNode  = document.createElement ('script');
			scriptNode.src  = '//ajax.googleapis.com/ajax/libs/jquery/' + jqVersion + '/jquery.min.js';
			scriptNode.addEventListener ("load", function () {
					var scriptNode          = document.createElement ("script");
					scriptNode.textContent  = 'var gm_jQuery  = jQuery.noConflict (true);\n(' + callbackFn.toString () + ')(gm_jQuery);';
					targ.appendChild (scriptNode);
			}, false);
			targ.appendChild (scriptNode);
	}


	if (typeof jQuery === "function") {
		this.$ = this.jQuery = jQuery.noConflict(true);
		uniworx(jQuery); // actual concrete call to uniworx_function
	} else {
		add_jQuery (uniworx, "1.7.2"); // alternative, loading jQuery first
	}
	