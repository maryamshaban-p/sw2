const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/products');
const app = express();
const productRouter = require('../product'); // Adjust path if necessary
jest.setTimeout(1000000);
// Set up Express app for testing
app.use(express.json());
app.use('/api/products', productRouter);

beforeAll(async () => {
  // Connect to a test database
  await mongoose.connect('mongodb://localhost/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // Clean up the database and close connection after tests
//  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Product API tests', () => {

  // Test POST /api/products/add
  it('should add a new product', async () => {
    const newProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      image: 'test-product.jpg'
    };

    const response = await request(app)
      .post('/api/products/add')
      .send(newProduct)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.msg).toBe('Product added successfully');
    expect(response.body.product.name).toBe(newProduct.name);
    expect(response.body.product.image).toBe(`/imgs/${newProduct.image}`);
  });

  // Test GET /api/products
it('should get all products using /all route', async () => {
  const response = await request(app)
    .get('/api/products/all')
    .expect(200);

  expect(Array.isArray(response.body)).toBe(true);
});


  // Test PUT /api/products/:id
  it('should update a product by ID', async () => {
    const newProduct = new Product({
      name: 'Old Product',
      description: 'Old Description',
      price: 19.99,
      image: 'old-product.jpg'
    });

    await newProduct.save();

    const updatedProduct = {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 39.99,
      image: 'updated-product.jpg'
    };

    const response = await request(app)
      .put(`/api/products/${newProduct._id}`)
      .send(updatedProduct)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.msg).toBe('Product updated successfully');
    expect(response.body.product.name).toBe(updatedProduct.name);
    expect(response.body.product.image).toBe(`/imgs/${updatedProduct.image}`);
  });

  // Test DELETE /api/products/:id
  it('should delete a product by ID', async () => {
    const newProduct = new Product({
      name: 'Product to Delete',
      description: 'Delete Description',
      price: 10.99,
      image: 'delete-product.jpg'
    });

    await newProduct.save();

    const response = await request(app)
      .delete(`/api/products/${newProduct._id}`)
      .expect(200);

    expect(response.body.msg).toBe('Product deleted successfully');
  });
it('should add a product without an image field', async () => {
  const newProduct = {
    name: 'No Image Field',
    description: 'No image included',
    price: 10.0
    // image field is missing
  };

  const response = await request(app)
    .post('/api/products/add')
    .send(newProduct)
    .expect(201);

  expect(response.body.product.image).toBe('');
  console.log(response.body);

});



it('should fetch products using /all route', async () => {
  const response = await request(app)
    .get('/api/products/all')
    .expect(200);


  expect(Array.isArray(response.body)).toBe(true);
  console.log(response.body);
});

it('should handle error in /all route', async () => {
  const findSpy = jest.spyOn(Product, 'find').mockImplementationOnce(() => {
    throw new Error('DB error');
  });

  const response = await request(app)
    .get('/api/products/all')
    .expect(500);

  expect(response.body.msg).toBe('Server error');
  findSpy.mockRestore();
});
it('should return 404 if trying to update non-existing product', async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .put(`/api/products/${fakeId}`)
    .send({ name: 'Should not update' })
    .expect(404);

  expect(response.body.msg).toBe('Product not found');
});
it('should return 404 when trying to delete non-existing product', async () => {
  const fakeId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .delete(`/api/products/${fakeId}`)
    .expect(404);

  expect(response.body.msg).toBe('Product not found');
});
it('should handle DB error on product update', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const spy = jest.spyOn(Product, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Update failed'));

  const response = await request(app)
    .put(`/api/products/${fakeId}`)
    .send({ name: 'Error test' })
    .expect(500);

  expect(response.body.msg).toBe('Server error');
  spy.mockRestore();
});
it('should handle DB error on product delete', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const spy = jest.spyOn(Product, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Delete failed'));

  const response = await request(app)
    .delete(`/api/products/${fakeId}`)
    .expect(500);

  expect(response.body.msg).toBe('Server error');
  spy.mockRestore();
});

});
