"use strict";
// Import
var expect = require('chai').expect,
	joe = require('joe'),
	fsUtil = require('fs')

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
		var chain = Chainy.subclass()
			.addExtension('test', 'utility', extension)
			.create()
		expect(chain.test).to.eql(extension)
	})

	it("it should have autoloaded the set plugin", function(next){
		var a = [1,[2,3]]
		Chainy.create()
			.set(a)
			.action(function(result){
				expect(result).to.equal(a)
			})
			.done(next)
	})

	it("it should autoinstall the flatten plugin on node v0.11+", function(next){
		var a = [1,[2,3]]
		try {
			Chainy.create().require('exec flatten')
				.set(a)
				.flatten()
				.action(function(result){
					expect(result).to.deep.equal([1,2,3])
				})

				// remove flatten dependency
				.set('npm uninstall --save chainy-plugin-flatten')
				.exec()

				// complete
				.done(next)
		} catch ( err ) {
			if ( require('semver').satisfies(process.version, '>=0.11') === false ) {
				console.log('error expected as we are on node <0.11')
				next()
			} else {
				next(err)
			}
		}
	})

})