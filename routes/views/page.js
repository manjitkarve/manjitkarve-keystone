var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
  var template="";

	// locals.section is used to set the currently selected
	// item in the header navigation.

  if (req.route.path === "/" || req.route.path === "/home"){
    locals.section = 'about-page';
    locals.title = "About | "+keystone.get("brand");
    locals.IDprefix = "about-";
    template="index";
  } else if (req.route.path === "/contact") {
    locals.section = 'contact-menu';
    locals.title = "Contact | "+keystone.get("brand");
    locals.IDprefix = "contact-";
    template="contact";
  } else if (req.route.path === "/resume") {
    locals.section = 'resume-page';
    locals.title = "Résumé | "+keystone.get("brand");
    locals.IDprefix = "resume-";
    template="resume";
  } else if (req.route.path === "/portfolio") {
    locals.section = 'portfolio-page';
    locals.title = "Portfolio | "+keystone.get("brand");
    locals.IDprefix = "portfolio-";
    template="portfolio";
  } else if (req.route.path === "/services") {
    locals.section = 'services-page';
    locals.title = "Services | "+keystone.get("brand");
    locals.IDprefix = "services-";
    template="services";
  }
	// Render the view
	view.render(template);
};
