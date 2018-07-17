const expect = require('chai').expect;
const chai = require('chai');
const _ = require('lodash');
const { ItemDAO, getItems, getNumItems } = require('./../items');
const MongoClient = require('mongodb').MongoClient;

/* global define, it, describe, before, beforeEach, afterEach, after */
describe('Test Items', () => {
  let db = null;
  let items = null;
  before('Create connection', () => {
    return MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
      .then(client => {
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
  it('Should get items filtered by category ', () => {
    return getItems({
      category: 'Umbrellas',
      db
    }).then(itemsFiltered => {
      itemsFiltered.forEach(element => {
        expect(element.category).to.be.equal('Umbrellas');
      });
    });
  });
  it('Shoudl get items filtered by category, include page and itemsPerPage ', () => {
    return getItems({
      category: 'Apparel',
      page: 0,
      itemsPerPage: 5,
      db
    }).then(itemsFiltered => {
      itemsFiltered.forEach(element => {
        expect(element.category).to.be.equal('Apparel');
      });
      expect(itemsFiltered.length).to.be.equal(5);
    });
  });
  it('Should get items filtered by category, include page and itemsPerPage ', () => {
    return getItems({
      category: 'Apparel',
      page: 1,
      itemsPerPage: 5,
      db
    }).then(itemsFiltered => {
      itemsFiltered.forEach(element => {
        expect(element.category).to.be.equal('Apparel');
      });
      expect(itemsFiltered.length).to.be.equal(1);
    });
  });
  it('Should get all categories with pagination', () => {
    return getItems({
      category: 'All',
      page: 0,
      itemsPerPage: 30,
      db
    }).then(itemsFiltered => {
      expect(itemsFiltered.filter(element => element.category === 'Umbrellas').length).to.be.equal(2);
      expect(itemsFiltered.length).to.be.equal(23);
    });
  });
  it('Should get all categories inside ItemDao', () => {
    const getItemsPromisified = () => {
      return new Promise((resolve, reject) => {
        items.getItems('All', 0, 5, itemsFiltered => {
          resolve(itemsFiltered);
        });
      });
    };
    return getItemsPromisified()
      .then(itemsFiltered => {
        expect(itemsFiltered.filter(element => element.category === 'Umbrellas').length).to.be.equal(0);
        expect(itemsFiltered.length).to.be.equal(5);
      });
  });
  it('Should get the count for a category', () => {
    return getNumItems({ category: 'Umbrellas', db })
      .then(count => expect(count).to.be.equal(2));
  });
  it('Should get the count for a category', () => {
    const getNumItemsPromisified = ({ category }) => new Promise((resolve, reject) => {
      items.getNumItems(category, numItems => {
        resolve(numItems);
      });
    });
    return getNumItemsPromisified({ category: 'Apparel' })
      .then(count => expect(count).to.be.equal(6));
  });
  const searchItems = ({ query, page, itemsPerPage }) => {
    return new Promise((resolve, reject) => {
      items.searchItems(query, page, itemsPerPage, itemsSearched => resolve(itemsSearched));
    });
  };
  it('Should filter by index', () => {
    return searchItems({
      query: 'leaf',
      page: 1,
      itemsPerPage: 5
    })
      .then(elements => {
        expect(elements.length).to.be.equal(2);
      });
  });
  const getItemById = ({itemId}) => {
    return new Promise((resolve, reject) => {
      items.getItem(itemId, resolve);
    });
  };
  it('Should get element by id', () => {
    return getItemById({ itemId: 1, db })
      .then(item => {
        expect(item.title).to.be.equal('Gray Hooded Sweatshirt');
      });
  });
  const getNumSearchItemsPromisified = ({query}) => {
    return new Promise((resolve, reject) => {
      items.getNumSearchItems(query, resolve);
    });
  };
  it('Should get the number of items searched', () => {
    return getNumSearchItemsPromisified({query: 'leaf'})
      .then(count => expect(count).to.be.equal(7));
  });
  after('Close connection', () => {
    db.close();
  });
});


