const expect = require('chai').expect;
const chai = require('chai');
const _ = require('lodash');
const ItemDAO = require('./../items').ItemDAO;
const MongoClient = require('mongodb').MongoClient;

/* global define, it, describe, before, beforeEach, afterEach, after */
describe('Test Items', () => {
  let db = null;
  let items = null;
  before('Create connection', () => {
    return MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
      .then(client => {
        console.log('Succesfully connected to local mongo');
        db = client.db('mongomart');
        items = new ItemDAO(db);
      });
  });
  it('Should get all items with items.js', () => {
    const getCategoriesPromisified = () => {
      return new Promise((resolve, reject) => {
        items.getCategories(categories => {
          resolve(categories);
        });
      });
    };
    return getCategoriesPromisified()
      .then(categories => {
        expect(categories.length).to.be.equal(9);
        expect(categories.filter(element => element._id === 'All')[0].num).to.be.equal(23);
      });
  });
  it('Should aggregate categories', () => {
    return db.collection('item').aggregate([
      {
        $group: {
          _id: '$category',
          elements: { $addToSet: '$_id' }
        }
      },
      {
        $unwind: '$elements'
      },
      {
        $group: {
          _id: '$_id',
          num: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
      .toArray()
      .then(categories => {
        categories.push({
          _id: 'All',
          num: categories.reduce((prev, category) => {
            return prev + category.num;
          }, 0)
        });
        expect(categories.length).to.be.equal(9);
        expect(categories.filter(element => element._id === 'All')[0].num).to.be.equal(23);
      });
  });
  it('Shoudl get items filtered by category', () => {

  });
  after('Close connection', () => {
    db.close();
  });
});


