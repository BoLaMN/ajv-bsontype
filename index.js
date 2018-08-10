export default function(ajv) {

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
          return ((t === 'string') && /^[0-9a-fA-F]{24}$/.test(a)) ||
          ((t === 'object') && (a._bsontype === 'ObjectID'));
        case 8: case 'bool': case 'boolean':
          return t === 'boolean';
        case 9: case 'date':
          return (t === 'date') ||
          ((t === 'string') && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/.test(a));
        case 10: case 'null':
          return t === 'null';
        case 11: case 'regex':
          return t === 'regex';
        case 16: case 'int':
          return (t === 'number') && (a <= 2147483647) && ((a + '').indexOf('.') === -1);
        case 18: case 'long':
          return (t === 'number') && (a > 2147483647) && (a <= 9223372036854775807) && ((a + '').indexOf('.') === -1);
        case 19: case 'decimal':
          return t === 'number';
        default: return false;
      }
    };
  };

  ajv.addKeyword('bsonType', {
    validate: (schema, data) => {
      const validate = $type(data);

      if (Array.isArray(schema)) {
        return schema.some(validate);
      } else { return validate(schema); }
    }
  }
  );

};
