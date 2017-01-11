const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

// 1. function to seed blog post db with fake data (call fake blog post object function here)
// 1b. (create function that generates blog post object)
function seedBlogPostData() {
	console.info('seeding blog post data')
	const seedData = [];

	seedData.push(generateBlogPostData());
	//return Promise
	return BlogPost.insertMany(seedData);
}

function generateBlogPostData() {
	return {
		author: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName()
		},
		title: faker.lorem.word(),
		content: faker.lorem.sentence(),
		created: faker.date.recent()
	}
}

// tear down fake database
function tearDownDb() {
	console.warn('deleting database');
	return mongoose.connection.dropDatabase();
}

describe('BlogPost API resource', function () {
	// hook functions for returning Promises 
	// 1. before any call is made, need to start test database server
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	// 2. before each API call is made, seed the database
	beforeEach(function() {
		return seedBlogPostData();
	});
	// 3. after each call is made, tear down db so that call is made fresh
	afterEach(function() {
		return tearDownDb();
	});
	// 4. when its all done, close the server
	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {
		it('should return all existing blog posts', function() {
			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				res.body.blogposts.should.have.length.of.at.least(count);
				return BlogPost.count();
			})
			.then(function(count) {
				res.body.blogposts.should.have.length.of(count);
			})
		});

		it('should return blog posts with correct fields', function() {
			let resBlogPosts; 
			return chai.request(app)
			.get('/posts')
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json; 
				res.body.blogposts.should.be.a('array');
				res.body.blogposts.should.have.length.of.at.least(1);

				res.body.blogposts.forEach(function(blogpost) {
					blogpost.should.be.a('object');
					blogpost.should.include.keys(
						'id', 'author', 'title', 'content');
				});
				resBlogPosts = res.body.blogposts[0];
				return BlogPost.findById(resBlogPosts.id);
			})
			.then(function(blogpost) {
				resBlogPosts.id.should.equal(blogpost.id);
				resBlogPosts.author.should.equal(blogpost.author);
				resBlogPosts.title.should.equal(blogpost.title);
				resBlogPosts.content.should.equal(blogpost.content);
			});
		});
	});

	describe('POST endpoint', function() {
		it('should add a new blog post', function() {
			const newBlogPost = generateBlogPostData();

			return chai.request(app)
			.post('/posts')
			.send(newBlogPost)
			.then(function(res) {
				res.should.have.status(204);
				res.should.be.json; 
				res.body.should.be.a('object');
				res.body.should.include.keys('id', 'author', 'title', 'content')
				res.body.author.should.equal(newBlogPost.author);
				res.body.id.should.not.be.null;
				res.body.title.should.equal(newBlogPost.title);
				res.body.content.should.equal(newBlogPost.content)
				return BlogPost.findById(res.body.id);
			})
			.then(function(blogpost) {
				blogpost.author.should.equal(newBlogPost.name);
				blogpost.title.should.equal(newBlogPost.title);
				blogpost.content.should.equal(newBlogPost.content);
			})
		})// check that its only posting once - count before and after
	});

	describe('PUT endpoint', function() {
		it('should update blog post fields', function() {
			const updatePost = {
				title: "New title",
				content: "Supercalifragilisticexpialidotious"
			};

			return BlogPost
			.findOne()
			.execOne()
			.then(function(blogpost) {
				updatePost.id = blogpost.id;

				return chai.request(app)
				.put(`/posts/$blogpost.id`)
				.send(updatePost);
			})
			.then(function(res) {
				res.should.have.status(204);

				return BlogPost.findById(updatePost.id).exec();
			})
			.then(function(blogpost) {
				blogpost.author.should.equal(updatePost.author);
				blogpost.content.should.equal(updatePost.content);
			});
		});
	});

	describe('DELETE endpoint', function() {
		it('should delete a post by id', function() {
			let blogpost;

			return BlogPost
			.findOne()
			.exec()
			.then(function(_blogpost) {
				blogpost = _blogpost;
				return chai.request(app).delete(`/posts/${blogpost.id}`);
			})
			.then(function(res) {
				res.should.have.status(204);
				return BlogPost.findById(blogpost.id).exec();
			})
			.then(function(_blogpost) {
				should.not.exist(_blogpost);
			});
		});	
	});

});