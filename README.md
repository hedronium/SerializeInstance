# SerializeInstance
A way to truly serialize & deserialize instance objects in NodeJS.

Don't you wish you could serialize an instance of a class into a string
and get a clone of the original object complete with all the methods
and prototype chain of the original upon deserialization?

This library does just that.

## Installation

```bash
$ npm install --save serialize-instance

// or
$ yarn add serialize-instance
```


## Example Usage

```JS
import {Serializer} from 'serialize-instance';
import {MyClass} from './MyClass';

// Serialization
let obj = new MyClass('Tomatoes');           //Instance Object
let serialized = Serializer.serialize(obj);  //Generic Object
let jsonified = JSON.stringify(serialized);  //JSON string


// Deserialization
let objectified = JSON.parse(jsonified);                //Generic Object
let deserialized = Serializer.deserialize(objectified); //Instance object


obj.constructor === deserialized.constructor // TRUE
```



## Limitations

- The constructor of all instances to be serialized must be exported from their modules.
- The constructor of an instance must not be defined in the entry file.

### Reasons

This library depends on a `WeakMap` populated from node's `require.cache`
therefore in order to recognize and store constructor metadata,
the constructor must be accessible in `require.cache`




## Warning

This was mostly just a proof of concept and is currently being used in
development for a very narrow case of serializing a few objects with `Buffer`s
and `Date`s to redis cache.

Use this library at your own risk.



## License
MIT