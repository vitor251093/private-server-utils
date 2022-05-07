const getBody = function(req, callback) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        callback(body)
    });
}

module.exports = function(req, res) {
    if (req.url === "/avatar_mp_db/v2/gateway.php") {
        getBody(req, function(body) {
            if (body === "COMMAND=GET_VERSION") {
                res.writeHead(200);
                res.end("88");
            }
            else {
                res.writeHead(404);
                res.end("");
            }
        })
        return
    }
    res.writeHead(404);
    res.end("");
}