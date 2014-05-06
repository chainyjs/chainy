var Chainy = require('./').extend({})
	.require(['add', 'feed', 'flatten', 'count', 'removeDuplicates', 'hasField', 'map', 'done', 'swap', 'pipe', 'log']);

Chainy.create()
	.add(['bevry','browserstate','ideashare','interconnectapp','docpad'])

	.feed(function(org){
		return "https://api.github.com/orgs/"+org+"/public_members";
	})

	.flatten().count()

	.removeDuplicates('id').count()

	.feed(function(user){
		return user.url;
	})

	.hasField('location').count()

	.map(function(user, complete){
		Chainy.create()
			.add([user])
			.feed(function(user){
				return "https://api.tiles.mapbox.com/v3/examples.map-zr0njcqy/geocode/"+user.location+".json";
			})
			.map(function(geo){
				if ( geo.results && geo.results[0] && geo.results[0][0] ) {
					var result = geo.results[0][0];
					user.coordinates = [result.lon, result.lat];
				}
				return geo;
			})
			.done(function(err){
				complete(err, user);
			});
	})

	.hasField('coordinates').count()

	.map(function(user){
		return {
			type: 'Feature',
			properties: {
				githubUsername: user.login
			},
			geometry: {
				type: 'Point',
				coordinates: user.coordinates
			}
		};
	})

	.swap(function(data){
		return {
			type: 'FeatureCollection',
			features: data
		};
	})

	.swap(function(data){
		return JSON.stringify(data, null, '\t');
	})

	.pipe(
		require('fs').createWriteStream('./out.geojson')
	)

	.done(function(err, result){
		if ( err ) {
			console.log(err.stack || err);
		} else {
			console.log('completed successfully without errors');
		}
	});
