const pool = require('../controllers/db');

const getAllTrends = (req, res) => {
    pool.query('SELECT * FROM trends', (error, results) => {
        if (error) {
            console.error('Error getting all trends:', error);
            res.status(500).send('Error retrieving trends');
            return;
        }
        res.render('inventory', { trends: results, user: req.session.user, category: 'All Investment Types' });
    });
};

const getStocks = (req, res) => {
    pool.query('SELECT * FROM trends WHERE category = "stocks"', (error, results) => {
        if (error) {
            console.error('Error getting stocks:', error);
            res.status(500).send('Error retrieving stocks');
            return;
        }
        res.render('inventory', { user: req.session.user, trends: results, category: 'Stocks' });
    });
};

const getCrypto = (req, res) => {
    pool.query('SELECT * FROM trends WHERE category = "crypto"', (error, results) => {
        if (error) {
            console.error('Error getting crypto trends:', error);
            res.status(500).send('Error retrieving crypto trends');
            return;
        }
        res.render('inventory', { user: req.session.user, trends: results, category: 'Crypto' });
    });
};

module.exports = {
    getAllTrends,
    getStocks,
    getCrypto
};