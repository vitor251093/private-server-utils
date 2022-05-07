const shell = require('./shell')
const os = require('os')

// https://www.wireshark.org/docs/wsug_html_chunked/ChCustCommandLine.html
// https://baturorkun.medium.com/using-wireshark-command-line-tool-tshark-62a32beef12c

// sudo tshark -i any -a duration:15 -T json

module.exports = async function(opts) {
    const exe = os.platform === "win32" ? "tshark.exe" : "tshark"
    return JSON.parse(await shell.runCommandAsRoot(`${exe} -i any -a duration:${opts.duration} -T json`))
}