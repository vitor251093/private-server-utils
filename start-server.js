const http = require("http")
const serverMock = require('./server-mock')

const tcpPortsOnly = false
const allPorts = false

const host = '127.0.0.1';
const ports = [80, 443]
if (!tcpPortsOnly) {
    const lastPort = allPorts ? 65535 : 49151
    for (let port = 1024; port <= lastPort; port++) {
        ports.push(port)
    }
}
const totalPortsCount = ports.length
let loadedPortsCount = 0

const requestListener = function(req, res) {
    let info = {
        headers: req.headers,
        httpVersion: req.httpVersion,
        method: req.method,
        url: req.url
    }
    console.log(JSON.stringify(info, null, 2))

    serverMock(req, res)
};
const server = http.createServer(requestListener);

ports.forEach(port => {
    server.listen(port, host, () => {
        loadedPortsCount++
        if (loadedPortsCount === totalPortsCount) {
            console.log(`Ready`);
        }
    });
})
