const shell = require('./shell')
const fs = require('fs')
const redbird = require('redbird')
const http = require("http")

// https://www.wireshark.org/docs/wsug_html_chunked/ChCustCommandLine.html
// https://baturorkun.medium.com/using-wireshark-command-line-tool-tshark-62a32beef12c

// sudo tshark -i any -a duration:15 -T json

const knownFalsePositivesDns = fs.readFileSync("./dns_blacklist.txt", {encoding:"utf8"})
                .split("\n").map(dns => dns.trim()).filter(dns => dns.length > 0)

const sniffPackets = async function(opts) {
    return JSON.parse(await shell.runCommandAsRoot(`tshark -i any -a duration:${opts.duration} -T json`))
}

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
    
    let output = await sniffPackets(opts)
    let dnses = extractDnsListFromPackets(output)
    let ignorableList = opts.includeKnownFalsePositives === true ? [] : knownFalsePositivesDns
    ignorableList.push(hostname)

    return dnses.filter(dns => !ignorableList.includes(dns) && !dns.endsWith(".mygateway"))
}

recoverDnsList({duration:15})
    .then(dnsList => {
        console.log(dnsList)
        
        const host = 'localhost';
        const port = 8080;
        // const requestListener = function(req, res) {
        //     res.writeHead(404);
        //     res.end("");
        // };
        // const server = http.createServer(requestListener);
        


        var proxy = redbird({port: 80});
        dnsList.forEach(dns => {
            proxy.register(dns, `http://${host}:${port}`);
        })

        var sslProxy = redbird({port: 443});
        dnsList.forEach(dns => {
            sslProxy.register(dns, `http://${host}:${port}`);
        })
        // server.listen(port, host, () => {
        //     console.log(`Server is running on http://${host}:${port}`);
        // });

        //sniffPackets({duration:duration}).then(packets => console.log(JSON.stringify(packets, null, 2)))
    })
