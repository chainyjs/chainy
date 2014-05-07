// Fetch the cwd's branches, and delete each of them except master from the git remote
var Chainy = require('../').extend().require(['exec', 'swap', 'log']);
Chainy.create()
    .exec('git branch --no-color', {cwd:process.cwd()})
    .swap(function(value){
        return value.replace('*', '').replace(/ |^\s+|\s+$/g, '').split('\n');
    })
    .log();