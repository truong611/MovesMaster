const Timestamp = require('../../scalarType/Timestamp');
const { GraphQLUpload } = require('graphql-upload');

const resolvers = { 
  Timestamp,
  Upload: GraphQLUpload,
}

module.exports = resolvers