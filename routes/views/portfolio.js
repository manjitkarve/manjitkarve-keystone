var keystone = require('keystone');
var cheerio = require('cheerio');
var fs = require('fs');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'portfolio-page';
	locals.title = "Portfolio | "+keystone.get("brand");
	locals.IDprefix = "portfolio-";
	locals.resumeSections = {};


	keystone.list('Post').model.find({'url': '/portfolio'}).exec().then(function(pages){
		for (var i in pages){
			var page = pages[i];
			locals.portfolioSections[page.title]=page.content.brief;
		}
		view.render('portfolio');
	}, function (err) { //something happened
			//catch the error, it can be thrown by any promise in the chain
			console.log("error", err);
	});

	// Render the view
	//view.render('resume');
};
