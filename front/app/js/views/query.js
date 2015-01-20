var $ = window.$;
var BB = require('../../../node_modules/backbone/backbone.js');
var MenuView = require('../views/menu'); 
var ChordView = require('../views/chord');
var GlobeView = require('../views/globe');
var ColumnsView = require('../views/columns');
var HiveView = require('../views/hive');
var ModalView = require('../views/modal');
var CountryModalView = require('../views/modal_country');
var Events = require('../event_manager'); 
var Data = require('../data_manager');

var QueryView = BB.View.extend({

	className: 'btn-group',

	initialize: function () {
		// this should initialize once
		// it should then handle the creation and destruction of menus,
		// but shouldn't render them, and shouldn't rerender itself
		var me = this;
		Events.on('foreignKeysReplaced', function(){
			me.createDefaultMenus();
		});
		Events.on('menuItemChosen', function(item, menu){
			console.log("menu item", item);
			me.handleMenuChoice(item, menu);
		});
		this.chart = null;
		this.menus = [];
		this.initViews();
		console.log("loading query");
		Data.initializeCollections();
		this.resizeListener();
	},
	
	resizeListener: function(){
		$(window).resize(function() {
			var w = ($( window ).width());
			var h = ($( window ).height() - 40);
			if ($('.resize-chart').length) {
				$('.resize-chart').attr("width", w).attr("height", h);
			}
			if ($('#globe').length) {
				var canvas = document.querySelector('canvas');
				var width = window.innerWidth;
				if (width < 1200) {
					var ratio = canvas.height/canvas.width;
					var height = width * ratio;
					canvas.style.width = width+'px';
					canvas.style.height = height+'px';			
				} else {
					canvas.style.width = '1200px';
					canvas.style.height = '600px';
				}											
			}
		});
	},

	randomChoice: function(arr){
		return arr[Math.floor(Math.random()*arr.length)];
	},

	handleMenuChoice: function(item, menu){
		if ( menu === this.menus[0]){
			console.log("a new collection was chosen", item.menuName);
			this.handleSelectedCollection(item);
			this.populateInfoPane(item.menuName);
		} else if ( menu === this.menus[1] ){
			console.log("a collection option was chosen", item);
		}
	},

	createDefaultMenus: function(){
		console.log("creating default menus");
		// choose one collection randomly
		var keys = ['facultys', 'projects', 'topics', 'locations',  'works'];
		var randomChoiceKey  = this.randomChoice(keys);
		var randomChoice = Data.collections.get(randomChoiceKey);
		// get the default collections
		var choices = keys.map(function(key){ return Data.collections.get(key); });
		// add a menu with the item chosen, the possible itemsm and a handler for
		// the choice
		this.addMenu({
			choice: randomChoice,
			menuItems: choices,
		}).chooseItem('Faculty');
	},

	handleSelectedCollection: function(coll){
		// remove any existing chart
		console.log("handling choice", coll);
		if( this.chart ){
			this.chart.$el.remove();
			console.log("removedChart");
		}
		if( coll.viewOptions ){
			// if this collection has multiple view options
			// then select one at random and add a menu of the different options
			var randomChoice = this.randomChoice(coll.viewOptions);
			this.addMenu({
				choice: randomChoice,
				menuItems: coll.viewOptions,
			}).chooseItem(randomChoice);
			// currently there is no handler for view options
		} else {
			if( coll.key == 'locations' ){
				console.log("rendering globe view with", coll.globeData());
				this.renderGlobeView(coll.globeData());
				this.renderCountryModalView(coll);
				console.log("viewport listener initiated");
				this.resizeListener(coll.globeData());
			} else if( coll.key == 'works' ){
				this.renderColumnsView(coll);
			} else if( coll.key == 'projects' ){
				console.log("rendering project view with", coll.graphData());
				this.renderProjectView(coll.graphData());
				//this.renderModalView(coll);
				//console.log("viewport listener initiated");
				//this.resizeListener(coll.graphData());
			}else {
				console.log("rendering chord view with", coll.graphData());
				this.renderChordView(coll.graphData());
				this.renderModalView(coll);
				console.log("viewport listener initiated");
				this.resizeListener(coll.graphData());
			}
		}
		
	},


	addMenu: function (options) {
		// append a new menu
		// ensure that the menus are aware of each other
		var rightMostMenu = this.menus[this.menus.length - 1];
		var newMenu = new MenuView(options, rightMostMenu);
		if( rightMostMenu !== undefined ) {
			rightMostMenu.right = newMenu;
		}
		this.menus.push(newMenu);
		this.$el.append(newMenu.$el);
		return newMenu;
	},

	removeMenu: function (slot) {
	},

	initViews: function(){
		this.views = {
			'globe': new GlobeView(),
		};
	},

	renderGlobeView: function(data){
		var view = this.views.globe;
		this.chart = view;
		$("#chart").append(view.$el);
		console.log("appended", view);
		view.render(data);
		var canvas = document.querySelector('canvas');
		var width = window.innerWidth;
		if (width < 1200) {
			var ratio = canvas.height/canvas.width;
			var height = width * ratio;
			canvas.style.width = width+'px';
			canvas.style.height = height+'px';			
		} else {
			canvas.style.width = '1200px';
			canvas.style.height = '600px';
		}
		
	},

	renderChordView: function(data){
		var view = new ChordView(data);
		this.chart = view;
		$("#chart").append(view.$el);
		console.log("appended", view);
		view.chord();
	},
	
	renderProjectView: function(data){
		var view = new HiveView(data);
		this.chart = view;
		$("#chart").append(view.$el);
		console.log("appended", view);
		view.hive();
	},

	renderColumnsView: function(data){
		var view = new ColumnsView(data);
		this.chart = view;
		$("#chart").append(view.$el);
		console.log("appended", view);
		view.render(data);
	},
	
	renderModalView: function(data){
		var modals = new ModalView(data);
		$("#modals").append(modals.$el);
		console.log("appended chord modals", modals);
		modals.render(data);
	},
	
	renderCountryModalView: function(data){
		var countryModals = new CountryModalView(data);
		$("#modals").append(countryModals.$el);
		console.log("appended country modals", countryModals);
		countryModals.render(data);
	},
	
	populateInfoPane: function(choice){
		if (choice === 'Faculty') {
			$('#onboarding-gif').html('<img src="/static/gifs/dusp-faculty-chord.gif" alt="Faculty Chord GIF" />');
			$('#onboarding-text').html('<p><strong>DUSP EXPLORER</strong> is an online, interactive visualization of MIT’s Department of Urban Studies & Planning. Here you can find information about our current faculty, where we work, and how our projects intersect with each other and connect with the central themes of urban planning and design.<p><p>Using the drop-down menu at the top of the page, you can begin to explore our department using the following lenses:</p><p><strong>Faculty:</strong> By default, the circumference of the Explorer displays all of our nearly 30 full-time professors. Hover over a name and you can see the intellectual connections that link that person with others in the department. By moving the mouse closer into the circle, you can trace any one of these links and drop the others. You can also rotate the Explorer by clicking and holding the mouse and dragging the diagram around the circumference. Finally, you can see a detailed view of each faculty member and their projects, publications, and collaborations by clicking on the faculty member\'s name.</p>');
		} else if (choice === 'Topics') {
			$('#onboarding-gif').html('<img src="/static/gifs/dusp-topic-chord.gif" alt="Topic Chord GIF" />');						
			$('#onboarding-text').html('<p><strong>DUSP EXPLORER</strong> is an online, interactive visualization of MIT’s Department of Urban Studies & Planning. Here you can find information about our current faculty, where we work, and how our projects intersect with each other and connect with the central themes of urban planning and design.<p><p>Using the drop-down menu at the top of the page, you can begin to explore our department using the following lenses:</p><p><strong>Topics:</strong> “Themes” are displayed around the circumference, and the individual faculty become the “links” between them. Hover over a topic and the Explorer will highlight connections with other themes, displaying the names of the faculty working at the intersections in the center of the circle. Clicking on the topic name will also show you a detialed list of all projects, publications, and faculty working within this topic.</p>');
		} else if (choice === 'Countries') {
			$('#onboarding-gif').html('<img src="/static/gifs/dusp-globe.gif" alt="Globe GIF" />');			
			$('#onboarding-text').html('<p><strong>DUSP EXPLORER</strong> is an online, interactive visualization of MIT’s Department of Urban Studies & Planning. Here you can find information about our current faculty, where we work, and how our projects intersect with each other and connect with the central themes of urban planning and design.<p><p>Using the drop-down menu at the top of the page, you can begin to explore our department using the following lenses:</p><p><strong>Countries:</strong> An interactive globe with project locations shown in blue. The globe can be rotated by dragging the mouse. When you click on the map or the country names at the left, the Explorer will display list of projects, publications, and faculty working in that country.</p>');			
		}
	},

});

module.exports = QueryView;
