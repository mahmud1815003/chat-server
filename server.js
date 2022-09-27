const auth = require("json-server-auth");
const jsonServer = require("json-server");
const express = require('express');
const http = require('http');
const app = express();
const socket = require('socket.io');

const server = http.createServer(app);
const io = socket(server);
global.io = io;
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 9000;

// Bind the router db to the app
app.db = router.db;

app.use(middlewares);

const rules = auth.rewriter({
    users: 640,
    conversations: 660,
    messages: 660,
});

app.use(rules);
app.use(auth);
app.use(router);

router.render = (req,res) => {
    const path = req.path;
    const method = req.method;
    if(path.includes('/conversations') && (method === 'POST' || method === 'PATCH')){
        //console.log(res.locals.data);
        io.emit("conversations", {
            data: res.locals.data
        })
    }else if(path.includes('/messages') && (method === 'POST')){
        console.log('hello');
        io.emit("messages", {
            data: res.locals.data
        });
    }
    res.json(res.locals.data);
}

server.listen(port);
