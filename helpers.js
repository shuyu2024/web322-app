const stripJs = require('strip-js');

module.exports = {
    equals: function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    },
    safeHTML: function (context) {
        return stripJs(context);
    }
};
