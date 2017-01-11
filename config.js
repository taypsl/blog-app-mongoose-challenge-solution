exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/blog-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'url'; //may need to wrap in ()
exports.PORT = process.env.PORT || 8080;