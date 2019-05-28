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

    return function(b) {
      switch (b) {
        case 1: case 'double':
          return (t === 'number') && ((a + '').indexOf('.') !== -1);
        case 2: case 'string':
          return t === 'string';
        case 3: case 'object':
          return t === 'object';
        case 4: case 'array':
          return t === 'array';
        case 6: case 'undefined':
          return [ 'null', 'undefined' ].includes(t);
        case 7: case 'objectId':
          return (t === 'object') && (a._bsontype === 'ObjectID');
        case 8: case 'bool': case 'boolean':
          return t === 'boolean';
        case 9: case 'date':
          return t === 'date';
        case 10: case 'null':
          return t === 'null';
        case 11: case 'regex':
          return t === 'regex';
        case 16: case 'int':
          return (t === 'number') && (a <= 2147483647) && ((a + '').indexOf('.') === -1);
        case 18: case 'long':
          return (t === 'number') && (a > 2147483647) && (a <= 9223372036854775807) && ((a + '').indexOf('.') === -1);
        case 19: case 'decimal': 
          return (t === 'object') && (a._bsontype === 'Decimal128');
        case 20: case 'number':
          return t === 'number';
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
