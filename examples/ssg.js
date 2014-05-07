// Example is conceptual at this stage
var Chainy = require('../').extend().require(['loadFiles', 'writeFiles']);

Chainy.create()
	.addPlugin('coffeekupFiles', function(opts, next){
		this.create().require(['set', 'query', 'map'])
			.set(this.data)
			.query({path: {$grep: 'src/documents/**/*.html.coffee*'}})
			.map(function(file, complete){
				this.create().require(['set', 'coffeekup', 'done'])
					.set(file.content)
					.coffeekup(opts)
					.done(function(err, result){
						if (err)  return complete(err, file);
						file.content = result;
						return complete(null, file);
					});
			})
			.done(next);
	})
	.loadFiles('src/documents')
	.coffeekupFiles()
	.writeFiles();