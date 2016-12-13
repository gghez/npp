import { Router } from "express";
import { v1 as neo4j } from "neo4j-driver";
import { json as jsonBodyParser } from "body-parser";
import { NpmDataProvider } from "./pricer/NpmDataProvider";
import { NpmApi } from "./npm/NpmApi";

export const router = Router();

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j"));

router.get('/npm-package/:name', (req, res, next) => {
    const npmApi = new NpmApi();
    const provider = new NpmDataProvider(npmApi);

    provider.get(req.params.name)
        .then((pkg) => res.send(pkg))
        .catch(next);
});

router.put('/package/:name', jsonBodyParser(), (req, res, next) => {
    const session = driver.session();

    session
        .run(`
        MERGE (p:Package {name:{name}})
        SET p.downloads = {downloads}
        RETURN p`, {
            name: req.params.name,
            downloads: req.body.downloads.month
        })
        .then((result) => {
            res.send({ records: result.records });
            session.close();
        })
        .catch(next);
});

router.get('/package/:name', (req, res, next) => {
    const session = driver.session();

    session
        .run('MATCH (p:Package {name:{nameParam}}) RETURN p', { nameParam: req.params.name })
        .then((result) => {
            res.send({ records: result.records });
            session.close();
        })
        .catch(next);

});
