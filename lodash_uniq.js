/// <reference path="./typings/lodash/lodash.d.ts" />

var _ = require('lodash');
var test = [
  { "topicId": 1, "subTopicId": 1, "topicName": "a", "subTopicName1": "w" },
  { "topicId": 2, "subTopicId": 2, "topicName": "b", "subTopicName2": "x" },
  { "topicId": 3, "subTopicId": 3, "topicName": "c", "subTopicName3": "y" },
  { "topicId": 4, "subTopicId": 4, "topicName": "c", "subTopicName4": "z" }
];

/**
 * 去除重复的元素
 * https://lodash.com/docs#uniq
 */

var t = _.uniq(test, 'topicId'),
  t2 = _.uniq(t, 'topicName'),
  dataMap = {
    topicId: 'id',
    topicName: 'name'
  };
var data = t2.map(function (topic) {
  var t = {};
  for (var key in dataMap) {
    t[dataMap[key]] = topic[key];
  };
  return t;
});


console.log(data);

//[{ id: 1, name: 'a' },
//  { id: 2, name: 'b' },
//  { id: 3, name: 'c' },
//  { id: 4, name: 'c' }]
