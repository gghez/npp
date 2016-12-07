import express from "express";
import { router as api } from "./api";
import morgan from "morgan";
import { debuglog } from "util";

const logger = debuglog('main');

let isDev = !/^prod/i.test(process.env.NODE_ENV);
let selfHosted = process.argv.indexOf('--self-hosted') >= 0;
logger('Environment:', isDev ? 'DEV' : 'PROD');
logger('Self Hosted:', selfHosted);

let app = express();

app.use(morgan(isDev ? 'dev' : 'combined'));
app.use('/api/', api);

if (isDev || selfHosted) {
    app.use('/web', express.static(__dirname + '/../'));
}

app.use((err, req, res, next) => {
    logger(err && err.stack || err);
    res.status(500).send({ error: err.message });
});

let port = process.env.PORT || 5001;

app.listen(port, () => {
    logger('service started on http://localhost:' + port);
});
