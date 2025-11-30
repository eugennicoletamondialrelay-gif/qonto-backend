const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const QONTO_IDENTIFIANT = process.env.QONTO_IDENTIFIANT;
const QONTO_SECRET_KEY = process.env.QONTO_SECRET_KEY;
const QONTO_API_URL = 'https://api.qonto.com/v2';

app.get('/health', (req, res) => {
  res.json({ status: 'Backend running!', timestamp: new Date() });
});

app.post('/api/transfer', async (req, res) => {
  try {
    const { amount, reference, label } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const response = await axios({
      method: 'POST',
      url: `${QONTO_API_URL}/transactions/transfers`,
      auth: {
        username: QONTO_IDENTIFIANT,
        password: QONTO_SECRET_KEY
      },
      data: {
        amount_cents: Math.round(amount * 100),
        label: label || 'Transfer from Cagnotte',
        reference: reference || 'CAGNOTTE-' + Date.now()
      }
    });
    res.json({
      success: true,
      transaction: response.data,
      message: `Transfer de €${amount} realizat!`
    });
  } catch (error) {
    console.error('Qonto Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

app.get('/api/account', async (req, res) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${QONTO_API_URL}/accounts`,
      auth: { username: QONTO_IDENTIFIANT, password: QONTO_SECRET_KEY }
    });
    res.json({ balance: response.data.accounts[0]?.balance_cents / 100 });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
