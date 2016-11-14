var keystone = require('keystone');
var cheerio = require('cheerio');
var fs = require('fs');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'resume-page';
	locals.title = "Résumé | "+keystone.get("brand");
	locals.IDprefix = "resume-";
	locals.resumeSections = {};


	keystone.list('Post').model.find({'url': '/resume'}).exec().then(function(pages){
		for (var i in pages){
			var page = pages[i];
			locals.resumeSections[page.title]=page.content.brief;
		}
		var $=cheerio.load(locals.resumeSections["workex-companies"]);
		var fCache=keystone.app.locals.fileCache;
		$(".company").each(function(){
			var companyID=$(this).attr("id");
			$("#"+companyID+" .details").html(locals.resumeSections[companyID]);
			$(this).addClass("collapsed");
		});

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
		locals.resumeSections["workex-companies"]=$.html();
		view.render('resume');
	}, function (err) { //something happened
			//catch the error, it can be thrown by any promise in the chain
			console.log("error", err);
	});

	// Render the view
	//view.render('resume');
};
