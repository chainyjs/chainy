
<!-- TITLE/ -->

# Chainy

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](http://img.shields.io/travis-ci/bevry/chainy.png?branch=master)](http://travis-ci.org/bevry/chainy "Check this project's build status on TravisCI")
[![NPM version](http://badge.fury.io/js/chainy.png)](https://npmjs.org/package/chainy "View this project on NPM")
[![Dependency Status](https://david-dm.org/bevry/chainy.png?theme=shields.io)](https://david-dm.org/bevry/chainy)
[![Development Dependency Status](https://david-dm.org/bevry/chainy/dev-status.png?theme=shields.io)](https://david-dm.org/bevry/chainy#info=devDependencies)<br/>
[![Gittip donate button](http://img.shields.io/gittip/bevry.png)](https://www.gittip.com/bevry/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](http://img.shields.io/bitcoin/donate.png?color=yellow)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](http://img.shields.io/wishlist/browse.png?color=yellow)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Perhaps the most awesome way of interacting with data using a chainable API

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

## Install

### [NPM](http://npmjs.org/)
- Use: `require('chainy')`
- Install: `npm install --save chainy`

<!-- /INSTALL -->


## Usage

### Using Chainy

``` javascript
var MyChainy = require('chainy').extend().require(['set', 'add', 'swap', 'map']);
var chainyInstance = new MyChainy();
```

### Understanding Plugins

Plugins are injected into the Chainy prototype using the `Chainy.addPlugin(name, method)` method:

- `name` is a string for the key that the plugin is inserted at, e.g. `Chainy.addPlugin('hello', function(){return 'world';})` has the plugin injected at `Chainy.prototype.hello`, making it availably via `chainyInstance.hello()`

- `method` is a synchronous or asynchronous method that you defined that will perform the action of your plugin


You can also use `Chainy.require(arrayOfPlugins)` to require bundled plugins with chainy, or to commonjs require an external plugin with the prefix`chainy-`. For example, running `Chainy.require(['add', 'hello'])` will require the bundled add plugin and the external plugin with the package name `chainy-hello`.


To avoid polluting the global Chainy prototype with your plugins, it is recommended that you use `Chainy.extend()` to create a local subclass of chainy that you can inject plugins into safely without polluting the global Chainy prototype:

```
var Chainy = require('chainy').extend().require(['add', 'set', 'map'])
```


Things to know about creating plugins:

1. The context (what `this` means) of the plugin method is set to the chain that the plugin is executing on, e.g.

	``` javascript
	chainyInstance.hello()
	// the context of hello's plugin method when executed will be that of `chainyInstance`
	```

2. This context is important, as your plugin will use it to apply the changes of the data back to the chain:

	``` javascript
	Chainy.addPlugin('x5', function(){
		this.data = this.data.map(function(value){
			return value*5;
		});
	});
	Chainy.create().set([1,2,3]).x5().log() // [5, 10, 15]
	```

3. You can also accept arguments in your plugin:

	``` javascript
	Chainy.addPlugin('x', function(n){
		this.data = this.data.map(function(value){
			return value*n;
		});
	});
	Chainy.create().set([1,2,3]).x(10).log() // [10, 20, 30]
	```

4. You can even make your plugin asynchronous by accepting an unspecified by the caller last argument called `next`:

	``` javascript
	Chainy.addPlugin('download', function(url, next){
		var chainyInstance = this;
		require('request')(url, function(err, response, body){
			if ( err ) {
				return next(err);
			}
			else {
				chainyInstance.data = body;
				return next();
			}
		});
	});
	Chainy.create().download('http://some.url').log() // outputs whatever http://some.url pointed to
	```

5. Plugin methods aren't fired directly, instead they are fired as tasks in the taskgroup runner of the chain. This allows tasks to be executed serially (one after the other) as well as safe error handling if a task fails, the following tasks will not execute.

### Available Plugins

[See the `src/lib/plugins` directory](https://github.com/bevry/chainy/blob/master/src/lib/plugins#files)

### Example Usage

[See the `examples` directory](https://github.com/bevry/chainy/blob/master/examples#files)


<!-- HISTORY/ -->

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/bevry/chainy/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `CONTRIBUTING.md` file.](https://github.com/bevry/chainy/blob/master/CONTRIBUTING.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

### Sponsors

No sponsors yet! Will you be the first?

[![Gittip donate button](http://img.shields.io/gittip/bevry.png)](https://www.gittip.com/bevry/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](http://img.shields.io/bitcoin/donate.png?color=yellow)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](http://img.shields.io/wishlist/browse.png?color=yellow)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

### Contributors

These amazing people have contributed code to this project:

- [Benjamin Lupton](https://github.com/balupton) <b@lupton.cc> — [view contributions](https://github.com/bevry/chainy/commits?author=balupton)

[Become a contributor!](https://github.com/bevry/chainy/blob/master/CONTRIBUTING.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT license](http://creativecommons.org/licenses/MIT/)

Copyright &copy; 2014+ Bevry Pty Ltd <us@bevry.me> (http://bevry.me)

<!-- /LICENSE -->


