(function(){
	// Import
	var expect = require('chai').expect
	joe = require('joe')
	Chainy = require('../').extend()

	// Chainy
	joe.describe('chainy', function(describe,it){
		it("should handle errors gracefully", function(next){
			Chainy.create()
				.addPlugin('oops', function(){
					throw new Error('deliberate failure')
				})
				.oops()
				.done(function(err, chainData){
					expect(err.message).to.eql('deliberate failure')
					expect(chainData).to.eql(null)
					return next()
				})
		})
	})

	// Plugins
	['set', 'hasfield', 'map', 'exec', 'uniq'].forEach(function(value){
		require('./plugins/'+value+'-test')
	})
})()