const Redis = require("ioredis");
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

require('dotenv').config()

if (typeof redisClient === 'undefined') {
    var redisClient = new Redis(`rediss://:${process.env.UPSTASH_REDIS_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL}:${process.env.UPSTASH_REDIS_REST_PORT}`);
}

const fetchProduct = async ({name, seller_id}) => {
    try {
        let params = {
            TableName: process.env.PRODUCT_DETAILS_TABLE,
            KeyConditionExpression: "#name = :name and #seller_id = :seller_id",
            ExpressionAttributeNames: {
                "#name": "name",
                "#seller_id": "seller_id"
            },
            ExpressionAttributeValues: {
                ":name": name,
                ":seller_id": seller_id
            }
        }

        const data = await docClient.query(params).promise();
        if (data.Count > 0) {
            return data.Items[0];
        } else {
            throw new Error('Product not found');
        }

    } catch (err) {
        return err;
    }
}

const fetchProductFromRedis = async ({name, seller_id}) => {
    try {
        let item = await redisClient.hget(name, seller_id);

        if (item === null) {
            item = await fetchProduct({name, seller_id});
            const isItemEmpty = Object.keys(item).length === 0
            if (isItemEmpty) {
                throw new Error('Product not found');
            } else {
                await redisClient.hset(name, seller_id, JSON.stringify(item));
            }
        }
        return item;

    } catch (err) {
        return err;
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        const {
            name,
            seller_id
        } = event.body

        const fetchedProduct = await fetchProductFromRedis({name, seller_id});

        return {
            'statusCode': 200,
            'body': fetchedProduct
        }
    } catch (err) {
        console.log('err', err);
        return err;
    }
};
