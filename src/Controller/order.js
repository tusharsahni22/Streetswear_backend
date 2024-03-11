const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Order = require("../Database/orderSchema"); 
const PendingOrders = require("../Database/PendingOrders");
const productSchema = require('../Database/productSchema');
const axios = require('axios');

let transporter = nodemailer.createTransport({
    host: 'streetswear.in',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'orders@streetswear.in', // generated ethereal user
      pass: 'Tusharsahni22', // generated ethereal password
    },
  });


// Create a new order
const addOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const order = new Order(req.body);
    const user = req.user;
    console.log(user);
    order.user = user._id;
    // Fetch the product from the database
    for (let item of req.body.products) {
        const product = await productSchema.findById(item.productId);
        // Check if the product exists
        if (!product) {
          return res.status(404).send({ error: 'Product not found', productId: item.productId });
        }
        // Add the product to the order
        order.items.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price,
          color: item.color,
          size: item.size
        });
      }
    // Save the order
    try {
      console.log('Preparing to save order...', order);
      const result = await order.save({session})
        // Send the order confirmation email
        const populatedOrder = await result.populate('items.product');
        let mailOptions = {
            from: 'orders@streetswear.in',
            to: user.email, // Change to your email address
            subject: 'Order Confirmation',
            html: `
            <h1>Thank you for your order!</h1>
            <p>Your order details:</p>
            <ul>
              ${populatedOrder.items.map(item => `
                <li>
                  <h2>${item.product.title}</h2>
                  <p>Quantity: ${item.quantity}</p>
                  <p>Price: ${item.product.price}</p>
                </li>
              `).join('')}
            </ul>
            <p>Total: ${populatedOrder.items.reduce((total, item) => total + item.quantity * item.product.price, 0)}</p>
            <p>We will send you another email when your order has been shipped.</p>
          `
        };
          // Wrap sendMail in a Promiseonsole.log('Preparing to send email...');

await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occurred while sending email:', error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  });
  
    await session.commitTransaction();
    session.endSession();
    res.status(201).send(result);

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({ message: 'Error while adding order', Error: err });
    }
  };
// Get all orders
const getOrder= async (req, res) => {
    // find all order with the user id
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    if (!orders) {
        return res.status(404).send({ error: 'No orders found' });
    }
    res.send(orders);
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product');
    res.send(order);
};

const pendingorders = async (req, res) => {
  console.log(req.params.id);
    const order = await PendingOrders.find({orderId:req.params.id}).populate('items.product');
    res.send(order);
};

const transferOrder = async (req,res)=> {
  // Find the order in the PendingOrder collection
  const pendingOrder = await PendingOrders.findOne({orderId:req.params.id});
  console.log(pendingOrder);
  if (!pendingOrder) {
    res.status(404).send({ error: 'No pending order found' });
    throw new Error(`No pending order found with id: ${req.params.id}`);
  }
  // Create a new order in the Order collection with the same data
  const order = new Order(pendingOrder.toObject());
  res.send(order);
  
}

// // Update an order
// const updateOrder= async (req, res) => {
//     const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.send(order);
// };

// // Delete an order
// router.delete('/orders/:id', async (req, res) => {
//     await Order.findByIdAndDelete(req.params.id);
//     res.status(204).send();
// });

module.exports = { addOrder, getOrder, getOrderById,pendingorders,transferOrder};