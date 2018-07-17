const expect = require('chai').expect;
const chai = require('chai');
const _ = require('lodash');
const { CartDAO } = require('./../cart');
const MongoClient = require('mongodb').MongoClient;

/* global define, it, describe, before, beforeEach, afterEach, after */
describe('Test Carts', () => {
  let db = null;
  let cart = null;
  before('Create connection', () => {
    return MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
      .then(client => {
        db = client.db('mongomart');
        cart = new CartDAO(db);
      });
  });
  const getCartPromisified = ({ userId }) => new Promise((resolve) =>
    cart.getCart(userId, resolve));
  it('Should get cart', () => {
    return getCartPromisified({userId: '558098a65133816958968d88'})
      .then(cartUser => {
        expect(cartUser.items.length).to.be.equal(5);
        const totalCostCart = cartUser.items.reduce((prev, item) =>
          prev + item.quantity * item.price, 0);
        expect(totalCostCart).to.be.equal(399.97);
      });
  });
  after('Close connection', () => {
    db.close();
  });
});