###
Feed Plugin
Replace the chain data with the results of a request using feedr for parsing and caching

Accepts a single argument, that can be a url string, a url function, or an object of options to send to feedr

If the url property is a function, it will be called with the current chain data and the return value will be used as the url

``` javascript
Chainy.create()
	.feed('http://some.url').log()  // result data of some url
```
###
feedr = require('feedr').create()
module.exports = (opts={}, next) ->
	chain = @

	opts = {url: opts}  if typeof opts in ['string', 'function']
	opts.url = opts.url?(@data) or opts.url
	opts.cache ?= 'preferred'  # this needs to be removed, ideally feedr will have a max age as default
	opts.parse ?= 'json'  # this needs to be removed, ideally feedr will also check the mime type of the response instead of just the extension of the url

	feedr.readFeed opts, (err, result) ->
		return next(err)  if err
		chain.data = result
		return next()

	@
