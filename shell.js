const child_process = require("child_process");
const sudo = require('sudo-prompt');

module.exports = (function() {
    return {
        runCommandAsRoot: function(regCommand) {
            return new Promise((resolve, reject) => {
                var options = {name: "Private Server Utils"};
                sudo.exec(regCommand, options, function(err, stdout, stderr) {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(stdout)
                });
            })
        },
        runCommand: function(regCommand) {
            return child_process.execSync(regCommand, {encoding: 'utf-8'})
        }
    }
}())