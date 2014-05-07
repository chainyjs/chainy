/**
Feed Plugin
Replace the chain data with the results of a request using feedr for parsing and caching

Accepts a single argument, that can be a url string, a url function, or an object of options to send to feedr

If the url property is a function, it will be called with the current chain data and the return value will be used as the url

``` javascript
Chainy.create()
	.feed('http://some.url').log()  // result data of some url
```
*/
module.exports = function(opts, next) {
	var chain = this

	if ( !opts ) {
		opts = {}
	}
	else {
		var type = typeof opts
		if ( type === 'string' || type === 'function' ) {
			opts = {url: opts}
		}
	}

	if ( typeof opts.url === 'function' ) {
		opts.url = opts.url(this.data)
	}
	if ( opts.cache == null )  opts.cache = 'preferred'
	// ^ this needs to be removed, ideally feedr will have a max age as default
	if ( opts.parse == null )  opts.parse = 'json'
	// ^ this needs to be removed, ideally feedr will also check the mime type of the response instead of just the extension of the url

	require('feedr').create().readFeed(opts, function(err, result){
		if (err)  return next(err)
		chain.data = result
		return next()
	})
}