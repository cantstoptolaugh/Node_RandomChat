// @ts-check
const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://admin:root@cluster0.zetuaqd.mongodb.net/'
const client = new MongoClient(uri, {})

module.exports = client
