// Example is conceptual at this stage
var Chainy = require('../').extend({}).require(['loadFiles', 'writeFiles']);

Chainy.create()
	.loadFiles('src/documents')
	.addPlugin('coffeekupFiles', function(files, next){
		Chainy.create().require(['set', 'query', 'map'])
			.set(files)
			.query({path: {$grep: 'src/documents/**/*.html.coffee*'}})
			.map(function(file, complete){
				Chainy.create().require(['set', 'coffeekup', 'done'])
					.set(file.content).coffeekup().done(function(err, result){
						if (err)  return complete(err, file);
						file.content = result;
						return complete(null, file);
					});
			});
	})
	.coffeekupFiles()
	.writeFiles();