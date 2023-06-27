const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://honestharry1980:deepak123@cluster0.fnheffu.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increased timeout duration to 30 seconds
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connected");
});

// Routes
app.get('/', getShortUrls);
app.post('/shortUrls', createShortUrl);
app.get('/:shortUrl', redirectShortUrl);

// Route handlers
async function getShortUrls(req, res) {
  const searchText = req.query.q;
  let shortUrls;

  if (searchText) {
    shortUrls = await findShortUrls({
      $or: [
        { full: { $regex: searchText, $options: 'i' } },
        { short: { $regex: searchText, $options: 'i' } },
        { note: { $regex: searchText, $options: 'i' } },
      ],
    });
  } else {
    shortUrls = await findShortUrls();
  }

  res.render('index', { shortUrls });
}

async function createShortUrl(req, res) {
  const { fullUrl, note } = req.body;
  const existingShortUrl = await ShortUrl.findOne({ full: fullUrl });

  if (existingShortUrl) {
    res.render('index', { shortUrls: await findShortUrls() });
  } else {
    await ShortUrl.create({ full: fullUrl, note });
    res.redirect('/');
  }
}

async function redirectShortUrl(req, res) {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });

  if (!shortUrl) {
    return res.sendStatus(404);
  }

  shortUrl.clicks++;
  await shortUrl.save();
  res.redirect(shortUrl.full);
}

// Utility functions
async function findShortUrls(query = {}) {
  return ShortUrl.find(query).exec();
}

// Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
