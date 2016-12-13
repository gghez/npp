import { Router } from "express";
import { v1 as neo4j } from "neo4j-driver";

export const router = Router();

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j"));

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
