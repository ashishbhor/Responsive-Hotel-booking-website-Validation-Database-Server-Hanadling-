
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// for file upload (passport photo)
const upload = multer({ storage: multer.memoryStorage() });

// ---------- MongoDB ----------
mongoose.connect(process.env.MONGODB_URI, { dbName: 'villa_booking' })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

// ---------- Schemas ----------
const OtpSchema = new mongoose.Schema({
  email: { type: String, index: true },
  code: String,
  expiresAt: Date,
}, { timestamps: true });

const Otp = mongoose.model('Otp', OtpSchema);

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  status: { type: String, default: 'pending' }, // pending | paid | cancelled

  userType: String, // indian | foreigner
  personal: mongoose.Schema.Types.Mixed,
  account: mongoose.Schema.Types.Mixed,
  stay: mongoose.Schema.Types.Mixed,
  payment: mongoose.Schema.Types.Mixed,

  amounts: {
    subtotal: Number,
    gst: Number,
    total: Number,
  },

  // optional photo
  photoName: String,
  photoBuffer: Buffer,

  // razorpay
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },

  emailSentAt: Date,
}, { timestamps: true });

const Booking = mongoose.model('Booking', BookingSchema);

// ---------- Email ----------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ---------- Razorpay ----------
const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ===========================
   OTP (Email) APIs
=========================== */
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.deleteMany({ email });
    await Otp.create({ email, code, expiresAt });

    await transporter.sendMail({
      from: `Grand Horizon Villa <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OTP for Booking',
      text: `Your OTP is ${code}. It expires in 10 minutes.`,
    });

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (e) {
    console.error('send-otp error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    const otp = await Otp.findOne({ email, code });
    if (!otp) return res.status(400).json({ success: false, error: 'Invalid code' });
    if (otp.expiresAt < new Date()) return res.status(400).json({ success: false, error: 'OTP expired' });

    await Otp.deleteMany({ email });
    res.json({ success: true });
  } catch (e) {
    console.error('verify-otp error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ===========================
   Bookings
=========================== */
// Create/save booking BEFORE payment (from your Step 4/5)
app.post('/api/bookings', upload.single('photo'), async (req, res) => {
  try {
    const personal = JSON.parse(req.body.personalDetails);
    const account = JSON.parse(req.body.accountDetails);
    const stay = JSON.parse(req.body.stayDetails);
    const payment = JSON.parse(req.body.paymentDetails);

    const bookingId = 'BK' + Math.floor(100000 + Math.random() * 900000);

    // compute on server (never trust client)
    const subtotal = Number(stay.totalAmount || 0);
    const gst = Math.round(subtotal * 0.18);
    const total = Number(stay.totalAmountWithGST || subtotal + gst);

    const doc = new Booking({
      bookingId,
      status: 'pending',
      userType: req.body.userType,
      personal,
      account,
      stay,
      payment,
      amounts: { subtotal, gst, total },
      photoName: req.file ? req.file.originalname : null,
      photoBuffer: req.file ? req.file.buffer : undefined,
    });

    await doc.save();
    res.json({ success: true, bookingId });
  } catch (err) {
    console.error('create booking error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Admin/list bookings
app.get('/api/bookings', async (req, res) => {
  const docs = await Booking.find().sort({ createdAt: -1 }).limit(200);
  res.json(docs);
});

// Single booking
app.get('/api/bookings/:bookingId', async (req, res) => {
  const doc = await Booking.findOne({ bookingId: req.params.bookingId });
  if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
  res.json(doc);
});

/* ===========================
   Razorpay (real payment)
=========================== */
// 1) Create order
app.post('/api/pay/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const amountPaise = Math.round((booking.amounts.total || 0) * 100);

    const order = await razor.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: bookingId,
      notes: { bookingId },
    });

    booking.razorpay.orderId = order.id;
    await booking.save();

    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId,
    });
  } catch (e) {
    console.error('create-order error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 2) Verify signature & mark paid, email receipt
app.post('/api/pay/verify', async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Signature mismatch' });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    booking.status = 'paid';
    booking.razorpay.paymentId = razorpay_payment_id;
    booking.razorpay.signature = razorpay_signature;
    await booking.save();

    const receiptUrl = `${process.env.APP_BASE_URL}/api/bookings/${bookingId}/receipt.pdf`;

    await transporter.sendMail({
      from: `Grand Horizon Villa <${process.env.SMTP_USER}>`,
      to: booking.account?.loginEmail || booking.personal?.email,
      subject: `Booking Confirmed - ${bookingId}`,
      html: `<p>Your booking <b>${bookingId}</b> is confirmed.</p>
             <p><a href="${receiptUrl}">Download Receipt (PDF)</a></p>`,
    });

    res.json({ success: true, message: 'Payment verified & booking confirmed', receiptUrl });
  } catch (e) {
    console.error('verify error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ===========================
   PDF Receipt
=========================== */
app.get('/api/bookings/:bookingId/receipt.pdf', async (req, res) => {
  const booking = await Booking.findOne({ bookingId: req.params.bookingId });
  if (!booking) return res.status(404).send('Not found');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=receipt-${booking.bookingId}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text('Grand Horizon Villa - Booking Receipt', { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Booking ID: ${booking.bookingId}`);
  doc.text(`Status: ${booking.status}`);
  doc.text(`Created: ${booking.createdAt.toLocaleString()}`);
  doc.moveDown();

  doc.text('Guest Details:', { underline: true });
  const p = booking.personal || {};
  doc.text(`Name: ${(p.firstName || p.fullName || '') + ' ' + (p.lastName || '')}`);
  doc.text(`Email: ${(booking.account && booking.account.loginEmail) || p.email || ''}`);
  doc.text(`Phone: ${p.phone || booking.payment?.mobile || ''}`);
  doc.moveDown();

  doc.text('Stay:', { underline: true });
  const s = booking.stay || {};
  doc.text(`Villa: ${s.selectedVilla?.name || ''}`);
  doc.text(`Check-in: ${s.checkIn || ''}`);
  doc.text(`Check-out: ${s.checkOut || ''}`);
  doc.text(`Nights: ${s.nights || ''}`);
  doc.moveDown();

  doc.text('Amount:', { underline: true });
  doc.text(`Subtotal: ₹${booking.amounts?.subtotal || 0}`);
  doc.text(`GST (18%): ₹${booking.amounts?.gst || 0}`);
  doc.text(`Total Paid: ₹${booking.amounts?.total || 0}`);
  doc.moveDown();

  doc.text('Thank you for booking with us!');
  doc.end();
});

// ---------- Production ----------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
