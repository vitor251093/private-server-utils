const shell = require('./shell')
const fs = require('fs')
const sniff = require('./sniff')

let duration = 40

const knownFalsePositivesDns = fs.readFileSync("./dns_blacklist.txt", {encoding:"utf8"})
                .split("\n").map(dns => dns.trim()).filter(dns => dns.length > 0)

const extractDnsListFromPackets = function(output) {
    return output.map(packet => packet["_source"].layers.dns)
            .filter(dns => dns !== undefined)
            .map(dns => dns.Queries)
            .filter(queries => queries !== undefined)
            .flatMap(queries => Object.values(queries))
            .map(query => query["dns.qry.name"])
            .filter((v, i, a) => a.indexOf(v) === i)
}

const recoverDnsList = async function(opts) {
    const hostname = shell.runCommand("hostname").trim()
    
    let output = await sniff(opts)
    let dnses = extractDnsListFromPackets(output)
    let ignorableList = opts.includeKnownFalsePositives === true ? [] : knownFalsePositivesDns
    ignorableList.push(hostname)

    return dnses.filter(dns => !ignorableList.includes(dns) && !dns.endsWith(".mygateway"))
}

recoverDnsList({duration:duration})
    .then(dnsList => {
        let str = dnsList.join("\n")
        fs.writeFileSync("./dns_list.txt", str, {encoding:"utf8"})
    })