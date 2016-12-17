import { Router } from "express";
import { v1 as neo4j } from "neo4j-driver";
import { GraphDataProvider } from "./data/GraphDataProvider";
import { ScoreProvider } from "./score/ScoreProvider";
import _ from "lodash";

export const router = Router();

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j"));
const dataProvider = new GraphDataProvider(driver);
const scoreProvider = new ScoreProvider();

router.get('/package/:name', (req, res, next) => {
    dataProvider.get(req.params.name)
        .then(p => res.send({ package: p }))
        .catch(next);
});

router.get('/search/:search', (req, res, next) => {
    dataProvider.search(req.params.search)
        .then(packages => {
            res.send({
                packages: _(scoreProvider.scoreAll(packages))
                    .orderBy('score', 'desc')
                    .value()
            });
        })
        .catch(next);
});
