(function(){
	// Import
	var expect = require('chai').expect,
		joe = require('joe')

	// Test
	joe.describe('map plugin', function(describe,it){
		var Chainy = require('../../').extend().require(['set', 'map', 'done'])
		
		it("should work with a synchronous iterator", function(next){
			Chainy.create()
				.set([1,2,3])
				.map(function(i){
					return i*5
				})
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.deep.equal([5, 10, 15])
					return next()
				})
		})

		it("should work with an asynchronous iterator", function(next){
			Chainy.create()
				.set([1,2,3])
				.map(function(i, complete){
					return complete(null, i*10)
				})
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.deep.equal([10, 20, 30])
					return next()
				})
		})
	})
})()
