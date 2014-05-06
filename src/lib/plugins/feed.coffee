module.exports = (opts={}, next) ->
	if typeof opts in ['function','string']
		opts = {url:opts}
	opts.cache = 'preferred'

	me = @
	feedr = require('feedr').create(opts)

	@clone().require(['map', 'done', 'log'])
		.map (item, complete) ->
			url = opts.url?(item) or opts.url
			feedr.readFeed({url, parse:'json'}, complete)
		.done (err, result) ->
			me.data = result
			return next(err)

	@