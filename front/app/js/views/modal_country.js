var d3 = require('d3');
var BB = require('backbone');
var Handlebars = require("hbsfy/runtime");
var modalTemplate = require('../templates/modal/modal_country.hbs');

// General modal view for all faculty and topic objects atached to chord diagrams

var Modals = BB.View.extend({
className: 'country-modals-group',

initialize: function(data){
	this.data = data;
	this.registerHBHelpers();
	this.render();
},

render: function(){	
	console.log("rendering country modals");
	var me = this;
	this.div = d3.select(this.el);
	
	this.modalDivs = this.div.selectAll('.single-country-modal')
		.data(this.data.models).enter()
		.append('div').attr('class', 'single-country-modal')
		.html(function(d){
			return modalTemplate(d);
		});

},

registerHBHelpers: function(){
	Handlebars.registerHelper('countryListTitle', function(works, needle, options) {
		var yes = 0;
		
		$.each(works, function(key, value) {
			if (value.attributes.work_types[0].attributes.name == needle) {
				yes = 1;
			}
		});
		
		if(yes == 1) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
	
	Handlebars.registerHelper('countryListContent', function(attributes, full_name, type, options) {
		var output = '';
		var periodicals = '';
		var publishers = '';
				
		for(var i=0, l=attributes.work_types.length; i<l; i++) {
			// add item name if the type is the type passed to the helper
			if (attributes.work_types[i].attributes.name == type) {
				output = output + '<div class="col-sm-12"><p class="modal-list-title">' +  attributes.title + '</p></div>';
				
				// add publication info if a publication
				if (attributes.publicationinfo) {
				    var d = new Date(attributes.publicationinfo.date_published);
				    var month = d.getMonth() + 1; //Months are zero based
				    var year = d.getFullYear();
					switch (month)
					{
					   case 1:
						   month = 'January';
						   break;
					   case 2:
						   month = 'February';
						   break;
					   case 3: 
						   month = 'March';
						   break;
					   case 4: 
						   month = 'April';
						   break;
					   case 5: 
						   month = 'May';
						   break;
					   case 6: 
						   month = 'June';
						   break;
					   case 7: 
						   month = 'July';
						   break;
					   case 8: 
						   month = 'August';
						   break;
					   case 9: 
						   month = 'September';
						   break;
					   case 10: 
						   month = 'October';
						   break;
					   case 11: 
						   month = 'November';
						   break;
					   case 12: 
						   month = 'December';
						   break;
					   default: 
					       month = '';
					       break;
					}
					
					if (attributes.publicationinfo.periodicals.length > 0) {
						periodicals = attributes.publicationinfo.periodicals[0].trim() + ', ';
					}
					
					if (attributes.publicationinfo.publishers.length > 0) {
						publishers = attributes.publicationinfo.publishers[0].trim() + ', ';
					}
					output = output + '<div class="col-sm-12"><p class="modal-fine-print">' + periodicals + publishers + 'Published ' + month + ' ' + year + '</p></div>';
					
					// add buffer of no unordered lists will appear
					if (attributes.topics.length === 0 && attributes.faculty.length === 0) {
						output = output + '<div class="buffer"></div>';
					} 
					
					
				}
				
				if (attributes.faculty.length > 0) {
					output = output + '<div class="col-sm-12"><p class="modal-list-first-element"><strong>Faculty</strong></p><ul>';

					for(var e=0, p=attributes.faculty.length; e<p; e++) {
						if (attributes.faculty[e].attributes.home_page !== '') {
							output = output + '<li><a href="' + attributes.faculty[e].attributes.home_page + '">' + attributes.faculty[e].attributes.full_name + '</a></li>';
						} else {
							output = output + '<li>' + attributes.faculty[e].attributes.full_name + '</li>';
						}
						
					}					
					output = output + '</ul></div>';
				}
								
				if (attributes.topics.length > 0) {
					output = output + '<div class="col-sm-12"><p class="modal-list-first-element"><strong>Topics</strong></p><ul>';

					for(var h=0, m=attributes.topics.length; h<m; h++) {
						output = output + '<li>' + attributes.topics[h].attributes.name + '</li>';
					}
					
					output = output + '</ul></div>';
				}
				
				output = output + '<div class="buffer"></div>';						
								
			}
		}
				
		return output;
		
	});
	

	
},

});

module.exports = Modals;