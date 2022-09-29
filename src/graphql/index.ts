import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServerLoaderPlugin } from "type-graphql-dataloader";
import { Container } from "typedi";
import { getConnection } from "typeorm";
import { Database } from "../database";
import Context from "./context";
import { resolvers } from "./resolvers";

export default async (db: Database) => {
    const schema = await buildSchema({
        resolvers,
        container: Container,
    });

    const server = new ApolloServer({
        schema,
        context: req => new Context(db, req),
        plugins: [
            ApolloServerLoaderPlugin({
                typeormGetConnection: getConnection, // for use with TypeORM
            }),
        ],
    });

    return server;
};
