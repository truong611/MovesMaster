const path = require('path');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeResolvers } = require('@graphql-tools/merge');

const types = loadFilesSync(path.join(__dirname, '.'), { extensions: ['js'], recursive: true })

//remove empty object in array
const newArray = types.filter(value => Object.keys(value).length !== 0);

module.exports = mergeResolvers(newArray);