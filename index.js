// npm install highland feedr

var _ = require('highland');
var feedr = require('feedr').create({cache:'preferred'});
var readFeed = _.wrapCallback(feedr.readFeed.bind(feedr));
var log = function(i){
	console.log(i);
	return i;
};
var fetchMembers = function(org){
	return readFeed({
		url: 'https://api.github.com/orgs/'+org+'/public_members',
		parse: 'json'
	});
};
var uniqueFielder = function(field){
	return function(items){
		var counts = {};
		return items.filter(function(item){
			var id = item[field];
			counts[id] = counts[id] || 0;
			++counts[id];
			return counts[id] === 1;
		});
	};
};
var expandArray = function(err, items, push, next){
	if ( err ) {
		push(err);
		next();
	}
	else {
		items.map(function(item){
			push(null, item);
		});
		next();
	}
};
var fetchDetails = function(user){
	return readFeed({
		url: user.url,
		parse: 'json'
	});
};
var fetchCoordinates = function(location, next){
	if ( !location ) {
		next(null, null);
	}
	else {
		feedr.readFeed({
			url: 'https://api.tiles.mapbox.com/v3/examples.map-zr0njcqy/geocode/'+location+'.json',
			parse: 'json'
		}, next);
	}
};
var injectCoordinates = function(err, user, push, next){
	if ( err ) {
		push(err);
		next();
	}
	else {
		fetchCoordinates(user.location, function(err, coordinates){
			user.coordinates = coordinates;
			push(err, user);
			next();
		});
	}
};

/*
var result = _(['./index.js', './package.json'])
	.map(readFile)
	.sequence()
	.invoke('toString', ['utf8'])
	.pipe(process.stdout)
	;
*/

// Fetch members
_(['bevry', 'browserstate', 'interconnectapp', 'docpad', 'ideashare'])
	.map(fetchMembers)
	.sequence()

	// Remove duplicates
	.collect()
	.map(uniqueFielder('id'))
	.consume(expandArray)

	// Fetch there complete details
	.map(fetchDetails)
	.sequence()

	// Inject the coordinates
	.consume(injectCoordinates)
	.map(function(user){
		if ( user.coordinates ) {
			var result = user.coordinates.results[0][0];
			user.coordinates = [result.lon, result.lat];
		}
		return user;
	})

	// Conect into a geojson file
	.filter(function(user){
		return user.coordinates !== null;
	})
	.map(function(user){
		return {
			type: "Feature",
			properties: {
				githubUsername: user.login
			},
			geometry: {
				type: "Point",
				coordinates: user.coordinates
			}
		};
	})
	.map(log)
	.collect()
	/* it stops working here due to the collect */
	.map(log)
	.map(function(features){
		console.log(features);
		return {
			type: "FeatureCollection",
			features: features
		};
	})
	.each(log)
	;
