const Redis = require("ioredis");
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

require('dotenv').config()

if (typeof redisClient === 'undefined') {
    var redisClient = new Redis(`rediss://:${process.env.UPSTASH_REDIS_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL}:${process.env.UPSTASH_REDIS_REST_PORT}`);
}

const createOrUpdateDDBProduct = async ({product}) => {
    try {
        const params = {
            TableName: process.env.PRODUCT_DETAILS_TABLE,
            Item: product
        }
        return await docClient.put(params).promise()
    } catch (err) {
        throw new Error(err)
    }
}

const addProductToRedis = async ({product}) => {
    try {
        const result = await redisClient.hset(product.name, product.seller_id, JSON.stringify(product)) // create or update hash
        await redisClient.zadd("products", product.price, JSON.stringify(product)); // create or update sorted set
        return result;
    } catch (err) {
        throw new Error(err)
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const product = JSON.parse(event.body)

        await createOrUpdateDDBProduct({product})
        await addProductToRedis({product})

        return {
            'statusCode': 200,
            body: JSON.stringify(product)
        }
    } catch (err) {
        return err
    }
}