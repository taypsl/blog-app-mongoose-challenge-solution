exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://user1:user1password@ds161038.mlab.com:61038/blog-goose';
exports.TEST_DATABASE_URL = (process.env.TEST_DATABASE_URL || 'mongodb://user1:user1password@ds019708.mlab.com:19708/grilledcheese'); 
exports.PORT = process.env.PORT || 8080;