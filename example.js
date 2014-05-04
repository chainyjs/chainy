var Chainy = require('./');

Chainy.create()
	.add(['bevry','browserstate','ideashare','interconnectapp','docpad'])

	.request(function(org){
		return "https://api.github.com/orgs/"+org+"/public_members";
	})

	.flatten().count()

	.removeDuplicates('id').count()

	.request(function(user){
		return user.url;
	})

	.hasField('location').count()

	.map(function(user, complete){
		Chainy.create()
			.add([user])
			.request(function(user){
				return "https://api.tiles.mapbox.com/v3/examples.map-zr0njcqy/geocode/"+user.location+".json";
			})
			.map(function(geo){
				if ( geo.results && geo.results[0] && geo.results[0][0] ) {
					var result = geo.results[0][0];
					user.coordinates = [result.lon, result.lat];
				}
				return geo;
			})
			.fn(function(){
				complete(null, user);
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

	.replace(function(data){
		return {
			type: 'FeatureCollection',
			features: data
		};
	})

	.replace(function(data){
		return JSON.stringify(data, null, '\t');
	})

	.pipe(
		require('fs').createWriteStream('./out.geojson')
	);
