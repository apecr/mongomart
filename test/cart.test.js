const expect = require('chai').expect;
const chai = require('chai');
const _ = require('lodash');
const { CartDAO } = require('./../cart');
const MongoClient = require('mongodb').MongoClient;

/* global define, it, describe, before, beforeEach, afterEach, after */
const USER_ID = '558098a65133816958968d88';
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
    return getCartPromisified({ userId: USER_ID })
      .then(cartUser => {
        expect(cartUser.items.length).to.be.equal(5);
        const totalCostCart = cartUser.items.reduce((prev, item) =>
          prev + item.quantity * item.price, 0);
        expect(totalCostCart).to.be.equal(399.97);
      });
  });
  const getItemInCartPromisified = ({ userId, itemId }) => new Promise(resolve =>
    cart.itemInCart(userId, itemId, resolve));
  it('Should get null for an item that is not in the cart', () => {
    return getItemInCartPromisified({
      userId: USER_ID,
      itemId: 3
    }).then(item => expect(item).to.be.null);
  });
  it('Should get an item that is in the cart', () => {
    return getItemInCartPromisified({
      userId: USER_ID,
      itemId: 2
    }).then(item => {
      expect(item._id).to.be.equal(2);
      expect(item.quantity).to.be.equal(12);
    });
  });
  after('Close connection', () => {
    db.close();
  });
});