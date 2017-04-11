"use strict";

let Serializer = require('../dist/Serializer').Serializer;
let Person = require('./Person').Person;



let jake = new Person('Jake', 'Smith');
console.log('Original Object Name: ', jake.name());



// Serialization
let serialized = Serializer.serialize(jake);
let jsonified = JSON.stringify(serialized);

console.log('Serialized Object: ', jsonified);



// Deserialization
let objectified = JSON.parse(jsonified);
let unserialized = Serializer.unserialize(objectified);

console.log('Unserialized Object Name: ', unserialized.name());
console.log('Constructor Match: ', jake.constructor === unserialized.constructor);