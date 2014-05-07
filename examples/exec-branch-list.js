// Fetch the cwd's branches, and convert them into an array
var Chainy = require('../').extend().require(['exec', 'swap', 'log']);
Chainy.create()
    .exec('git branch --no-color')
    .swap(function(value){
        return value.replace('*', '').replace(/ |^\s+|\s+$/g, '').split('\n');
    })
    .log();