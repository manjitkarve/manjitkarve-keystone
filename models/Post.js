var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Post.add({
	title: { type: String, required: true },
	postType: { type: Types.Select, index: true, required: true, options: [{value: 'page', label: 'Independent Page'}, {value: 'post', label: 'Blog Post'}, {value: 'blurb', label: 'Blurb'}], initial: true },
	url: { type: Types.Url, required: true, index: true, initial: true, dependsOn: { postType: ['page', 'blurb'] }, label: 'Page URL', default: function(){return '/'+this.title;} },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400, dependsOn: { postType: ['page', 'post']} },
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true }
});

Post.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});

Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
