"use strict";
// Import
var expect = require('chai').expect,
	joe = require('joe')

// Test Chainy
joe.describe('chainy', function(describe,it){
	var Chainy = require('../')

	it("should fail when attempting to extend the base class", function(){
		var err = null
		try {
			Chainy.addExtension('test', 'action', function(){})
		}
		catch (_err) {
			err = _err
		}
		expect(err && err.message).to.contain('frozen')
	})

	it("should pass when attempting to extend a child class", function(){
		var extension = function(){}
		var MyChainy = Chainy.subclass().addExtension('test', 'utility', extension)
		expect(MyChainy.prototype.test).to.eql(extension)
	})

	it("it should have autoloaded the set plugin", function(next){
		var a = [1,[2,3]]
		Chainy.create()
			.set(a)
			.done(function(err, result){
				if (err)  return next(err)
				expect(result).to.equal(a)
				return next()
			})
	})

	/*
	test currently disabled until we figure out how to prevent this from adding flatten to the dependencies in package.json
	it("it should autoinstall the flatten plugin on node v0.11+", function(next){
		var a = [1,[2,3]]
		try {
			Chainy.create().require('flatten')
				.set(a)
				.flatten()
				.done(function(err, result){
					if (err)  return next(err)
					expect(result).to.deep.equal([1,2,3])
					return next()
				})
		} catch ( err ) {
			if ( require('semver').satisfies(process.version, '>=0.11') === false ) {
				console.log('error expected as we are on node <0.11')
				next()
			} else {
				next(err)
			}
		}
	})
	*/

})