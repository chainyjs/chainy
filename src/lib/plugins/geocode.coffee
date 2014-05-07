modules.exports = `function(next){
	this.clone().require(['feed', 'swap'])
		.feed("https://api.tiles.mapbox.com/v3/examples.map-zr0njcqy/geocode/"+this.data+".json")
		.swap(function(geo){
			if ( geo.results && geo.results[0] && geo.results[0][0] ) {
				var result = geo.results[0][0];
				return [result.lon, result.lat];
			}
			return null;
		})
		.done(next);
}`