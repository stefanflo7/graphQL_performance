import express from "express";
import jwt from "express-jwt";
import expressPlayground from "graphql-playground-middleware-express";
import "reflect-metadata"; // this ensures type graphql works properly
import config from "./config";
import getDatabase from "./database";
import createGraphqlServer from "./graphql";

const init = async () => {
    const app = express();
    const db = await getDatabase(config.database);

    const server = await createGraphqlServer(db);

    const path = "/graphql";

    app.use(
        path,
        jwt({
            secret: config.auth.secret,
            credentialsRequired: false,
            algorithms: ["HS256"],
        }),
    );

    // for debugging
    app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

    server.applyMiddleware({ app, path });

    app.listen(5000);
    console.log(`App listening on port 5000!`);
};

init();
