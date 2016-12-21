import express from "express";
import { router as api } from "./api";
import morgan from "morgan";
import { debuglog } from "util";
import path from "path";

const logger = debuglog('main');

let isDev = !/^prod/i.test(process.env.NODE_ENV);
let selfHosted = process.argv.indexOf('--self-hosted') >= 0;
logger('Environment:', isDev ? 'DEV' : 'PROD');
logger('Self Hosted:', selfHosted);

let app = express();

app.use(morgan(isDev ? 'dev' : 'combined'));
app.use('/api/', api);

if (selfHosted) {
    app.use('/', express.static(path.resolve(__dirname, '../web/')));
    app.get('*', (req, res)=>{
        res.sendFile(path.resolve(__dirname, '../web/index.html'));
    });
}

app.use((err, req, res, next) => { // eslint-disable-line
    console.error(err && err.stack || err);
    res.status(500).send({ error: err.message });
});

let port = process.env.PORT || 5001;

app.listen(port, () => {
    logger('service started on http://localhost:' + port);
});
