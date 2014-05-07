# Import
{expect} = require('chai')
joe = require('joe')
Chainy = require('../../../').extend().require(['set', 'map', 'done'])

# Task
joe.describe 'map plugin', (describe,it) ->
	it "should work with a synchronous iterator", (next) ->
		Chainy.create()
			.set([1,2,3])
			.map (i) ->
				return i*5
			.done (err, result) ->
				return next(err)  if err
				expect(result).to.deep.equal([5, 10, 15])
				return next()

	it "should work with an asynchronous iterator", (next) ->
		Chainy.create()
			.set([1,2,3])
			.map (i, complete) ->
				return complete(null, i*10)
			.done (err, result) ->
				return next(err)  if err
				expect(result).to.deep.equal([10, 20, 30])
				return next()
