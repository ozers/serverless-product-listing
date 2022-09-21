const Redis = require("ioredis");
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
require('dotenv').config()

if (typeof redisClient === 'undefined') {
    var redisClient = new Redis(`rediss://:${process.env.UPSTASH_REDIS_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL}:${process.env.UPSTASH_REDIS_REST_PORT}`);
}


const getProducts = async ({page, limit}) => {
    const start = parseInt(page) * parseInt(limit);
    const stop = start + parseInt(limit) - 1
    return redisClient.zrange('products', start, stop)
}

// const getProductsWithPrice = async({page, limit}) => {
//     const start = parseInt(page) * parseInt(limit);
//     const stop = start + parseInt(limit) - 1
//     return redisClient.zrangebyscore('products', 0, 99,'withscores',limit)
// }

exports.lambdaHandler = async (event, context) => {
    try {
        const {limit, page} = event.body;
        const allProducts = await getProducts({limit, page});
        return {
            'statusCode': 200,
            'body': allProducts
        }

    } catch (err) {
        console.log(err);
        return err;
    }

};
