const Redis = require("ioredis");
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
require('dotenv').config()

if (typeof redisClient === 'undefined') {
    var redisClient = new Redis(`rediss://:${process.env.UPSTASH_REDIS_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL}:${process.env.UPSTASH_REDIS_REST_PORT}`);
}


const getProducts = async ({page, limit}) => {
    return redisClient.zrevrange('products', parseInt(page), parseInt(limit))
}

exports.lambdaHandler = async (event, context) => {
    try {
        const {limit,page} = JSON.parse(event.body);
        const allProducts = await getProducts({limit,page});
        return {
            'statusCode': 200,
            'body': allProducts
        }

    } catch (err) {
        console.log(err);
        return err;
    }

};
