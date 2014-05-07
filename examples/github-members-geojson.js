var Chainy = require('../').extend()
	.require(['set', 'feed', 'flatten', 'count', 'uniq', 'hasField', 'map', 'geocode', 'done', 'swap', 'pipe', 'log']);

Chainy.create()
	// Specifiy the github organisations to fetch members for
	.set(['bevry','browserstate','ideashare','interconnectapp','docpad'])

	// Fetch the public members for the organisations
	.map(function(org, complete){
		Chainy.create()
			.feed("https://api.github.com/orgs/"+org+"/public_members")
			.done(complete);
	})

	// Merge the results of each organisation together into one flat array
	.flatten().count()

	// As a github user could be in multiple organisations, lets ensure duplicates are removed
	.uniq('id').count()

	// Now lets replace the shallow member details with their full github profile details via the profile api
	.map(function(user, complete){
		Chainy.create()
			.feed(user.url)
			.done(complete);
	})

	// Lets remove any profiles that don't have a location sepcified
	.hasField('location').count()

	// With the location, geocode it, and set the result to the coordinates field
	.map(function(user, complete){
		Chainy.create()
			.set(user.location)
			.geocode()
			.done(function(err, result){
				if (err)  return complete(err, user);
				user.coordinates = result;
				return complete(null, user);
			});
	})

	// Remove any users where geocoding failed
	.hasField('coordinates').count()

	// Convert the user profiles into geojson entries
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

	// Wrap the user geojson entries into a geojson file
	.swap(function(data){
		return {
			type: 'FeatureCollection',
			features: data
		};
	})

	// Prepare the geojson data for writing by making it pretty
	.swap(function(data){
		return JSON.stringify(data, null, '\t');
	})

	// Write the geojson data to a file on our computer
	.pipe(
		require('fs').createWriteStream(__dirname+'/out.geojson')
	)

	// Handle success and possible errors
	.done(function(err, result){
		if ( err ) {
			console.log(err.stack || err);
		} else {
			console.log('completed successfully without errors');
		}
	});
