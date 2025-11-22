// controllers/paymentcontroller.js
const braintree = require('braintree');
require('dotenv').config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BT_MERCHANT_ID,
  publicKey:  process.env.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY,
});

async function getClientToken(req, res) {
  try {
    const { clientToken } = await gateway.clientToken.generate({});
    res.json({ clientToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token generation failed" });
  }
}

async function checkout(req, res) {
  console.log('BODY:', req.body);
  const { paymentMethodNonce, amount, doctorUserId } = req.body;
  if (!paymentMethodNonce || !amount) {
    return res.status(400).json({ error: "Missing nonce or amount" });
  }

  try {
    const result = await gateway.transaction.sale({
      amount,
      paymentMethodNonce,
      options: { submitForSettlement: true },
    });

    if (result.success) {
      // you can also record doctorUserId & transaction.id in your DB here
      res.json({ success: true, transactionId: result.transaction.id });
    } else {
      res.status(400).json({ success: false, errors: result.errors.deepErrors() });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction failed" });
  }
}

module.exports = { getClientToken, checkout };
