(function(){
	# Import
	{expect} = require('chai')
	joe = require('joe')
	Chainy = require('../../../').extend().require(['exec', 'done'])

	# Task
	joe.describe 'exec plugin', (describe,it) ->
		it "should work", (next) ->
			if process.env.TRAVIS
				console.log('skipping for travis environment')
				return next()

			Chainy.create()
				.exec('echo -n hello world')
				.done (err, result) ->
					return next(err)  if err
					expect(result).to.eql('hello world')
					return next()
})()