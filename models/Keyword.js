var keystone = require('keystone');

/**
 * Keyword Model
 * ==================
 */

var Keyword = new keystone.List('Keyword', {
	autokey: { from: 'name', path: 'key', unique: true },
});

Keyword.add({
	name: { type: String, required: true },
});

Keyword.relationship({ ref: 'Page', path: 'keywords' });

Keyword.register();
