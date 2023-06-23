
const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl')
const app = express();

mongoose.connect('mongodb://0.0.0.0:27017/url-Shortner',{
       useNewUrlParser: true, 
       useUnifiedTopology : true,
})
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connected");
})


app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))



// Search route
app.get('/', async (req, res) => {
       const searchText = req.query.q; 
       let shortUrls;
       if (searchText) {
           shortUrls = await ShortUrl.find({
               $or: [
                   { full: { $regex: searchText, $options: 'i' } }, 
                   { short: { $regex: searchText, $options: 'i' } }, 
                   { note: { $regex: searchText, $options: 'i' } }, 
               ],
           }).exec();
       } else {
           shortUrls = await ShortUrl.find().exec(); // Fetch all short URLs if no search query provided
       }
       res.render('index', { shortUrls });
       
   });
   
   // URL Short route
   app.post('/shortUrls', async (req, res) => {
       const { fullUrl, note } = req.body;
       const existingShortUrl = await ShortUrl.findOne({ full: fullUrl });
   
       if (existingShortUrl) {
           res.render('index', { shortUrls: await ShortUrl.find() });
       } else {
           await ShortUrl.create({ full: fullUrl, note:note});
           res.redirect('/');
       }
   });
    

   
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) return res.sendStatus(404);
    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
  });
  app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running on port 5000');
  });