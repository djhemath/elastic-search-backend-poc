import { Client } from "@elastic/elasticsearch";

const { Client: ElasticClient } = require('@elastic/elasticsearch')
const client: Client = new ElasticClient({
  node: 'http://localhost:9200'
});

module.exports = client;