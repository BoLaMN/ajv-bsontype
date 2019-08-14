module.exports = function(ajv) {

  const type = function(v) {
    if (v === null) {
      return 'null';
    }

    if (v === undefined) {
      return 'undefined';
    }

    const s = Object.prototype.toString.call(v);
    const t = s.match(/\[object (.*?)\]/)[1].toLowerCase();

    if (t === 'number') {
      if (isNaN(v)) {
        return 'nan';
      }

      if (!isFinite(v)) {
        return 'infinity';
      }
    }

    return t;
  };

  const $type = function(a) {
    const t = type(a);

    const checkBsonType = b => (t === 'object') && (a._bsontype === b);

    return function(b) {
      switch (b) {
        case 1: case 'double':
          return checkBsonType('Double') && (a.valueOf() <= Number.MAX_SAFE_INTEGER);
        case 2: case 'string':
          return t === 'string';
        case 3: case 'object':
          return t === 'object';
        case 4: case 'array':
          return t === 'array';
        case 5: case 'binData':
          return checkBsonType('Binary');
        case 6: case 'undefined': // Deprecated
          return false;
        case 7: case 'objectId':
          return checkBsonType('ObjectID');
        case 8: case 'bool': case 'boolean':
          return t === 'boolean';
        case 9: case 'date':
          return t === 'date';
        case 10: case 'null':
          return t === 'null';
        case 11: case 'regex':
          return t === 'regex';
        case 12: case 'dbPointer': // Deprecated
          return false;
        case 13: case 'javascript': // Not supported in Node driver
          return false;
        case 14: case 'symbol': // Deprecated
          return false;
        case 15: case 'javascriptWithScope': // Not supported in Node driver
          return false;
        case 16: case 'int':
          return checkBsonType('Int32') && (a.valueOf() <= 2147483647) && ((a.valueOf() + '').indexOf('.') === -1);
        case 17: case 'timestamp':
          return checkBsonType('Timestamp');
        case 18: case 'long':
          return checkBsonType('Long') && (a.toNumber() <= 9223372036854775807) && ((a.toNumber() + '').indexOf('.') === -1);
        case 19: case 'decimal':
          return checkBsonType('Decimal128');
        case -1: case 'minKey':
          return checkBsonType('MinKey');
        case 127: case 'maxKey':
          return checkBsonType('MaxKey');
        default: return false;
      }
    };
  };

  var validate = (schema, data) => {
    if (validate.errors === null)
      validate.errors = [];

    const v = $type(data);

    let msg, passed;

    if (Array.isArray(schema)) {
      msg = schema.join(', ');
      passed = schema.some(v);
    } else {
      msg = schema;
      passed = v(schema);
    }

    if (!passed) {

      validate.errors.push({
        keyword: 'bsonType',
        params: {
          bsonType: schema
        },
        message: `should be ${msg} got ${data}`
      });
    }

    return passed;
  };

  ajv.addKeyword('bsonType', {
    errors: true,
    validate
  });

};
