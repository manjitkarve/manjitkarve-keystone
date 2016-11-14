var keystone = require('keystone');
var cheerio = require('cheerio');
var fs = require('fs');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'about-page';
	locals.title = "About | "+keystone.get("brand");
	keystone.list('Post').model.findOne({'url': '/home'}).exec().then(function(page){
		var blurb=page.content.brief;
		var $ = cheerio.load(blurb);
		var fCache=keystone.app.locals.fileCache;
		$("img.replaceWithSVGContent").each(function(index, image){
			var src=$(image).attr("src");
			var newSrc = src.replace(/^(\.+\/)*/, "public/");
			if (newSrc.match(/\./g).length>1) {//throw an error if there's an attempt to access outside root
				throw new Error(src+" is outside app-root directory. Not allowed.");
			}
			var icon=fCache[newSrc];
			if ("undefined" === typeof icon){
				console.log("reading icon "+newSrc);
				try{
					icon=fs.readFileSync(newSrc, "utf8");
					fCache[newSrc]=icon;
				} catch (err) {
					console.log(err);
					icon=false;
				}
			} else {
				console.log("returning icon "+newSrc+" from cache.");
			}
			if (icon){
				$(image).replaceWith(icon);
			}
		});
		blurb=$.html();
		locals.blurb = blurb;
		view.render('index');
	});

	//view.query('page', keystone.list('Post').model.findOne({'slug': 'home'}));

	// Render the view
	
};
