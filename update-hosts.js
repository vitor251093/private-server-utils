const fs = require('fs')
const os = require('os')

let localhost = '127.0.0.1'
let etcHostsPath = os.platform === "win32" ? "C:\\Windows\\System32\\drivers\\etc" : "/etc/hosts"
let etcHostsEncoding = os.platform === "win32" ? 'ascii' : 'utf8'
let dnsList = fs.readFileSync('./dns_list.txt', {encoding:'utf8'}).split("\n")

let hosts = fs.readFileSync(etcHostsPath, {encoding:etcHostsEncoding}).split('\n')

let addNewLine = true
let index = hosts.length
let hostsLastWords = hosts.map(host => host.trim().split(' ').pop())
if (hostsLastWords.filter(host => dnsList.includes(host)).length > 0) {
    let indexes = dnsList.map(dns => hostsLastWords.indexOf(dns)).filter(i => i !== -1).sort((a,b) => a - b)
    index = indexes[0]
    indexes = indexes.sort((a,b) => b - a)
    indexes.forEach(indexToRemove => hosts.splice(indexToRemove, 1))
    addNewLine = false
}

dnsList.forEach(dns => hosts.splice(index, 0, `${localhost} ${dns}`))
if (addNewLine) {
    hosts.splice(index, 0, "")
}

let hostsStr = hosts.join('\n')
fs.writeFileSync(etcHostsPath, hostsStr, {encoding:etcHostsEncoding})

// Linux
// sudo service network-manager restart
