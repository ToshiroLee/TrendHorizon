const pool = require('../controllers/db');

const getAllTrends = (req, res) => {
    const userId = req.session.user.id;

    pool.query('SELECT * FROM trends', (error, trends) => {
        if (error) {
            console.error('Error getting trends:', error);
            res.status(500).send('Error retrieving trends');
            return;
        }
        res.render('investment', { user: req.session.user, trends: trends, category: 'All Investment Types' });
    });
};

const getStocks = (req, res) => {
    const userId = req.session.user.id;

    pool.query('SELECT * FROM trends WHERE category = "stocks"', (error, trends) => {
        if (error) {
            console.error('Error getting stocks:', error);
            res.status(500).send('Error retrieving stocks');
            return;
        }
        res.render('investment', { user: req.session.user, trends: trends, category: 'Stocks' });
    });
};

const getCrypto = (req, res) => {
    const userId = req.session.user.id;
    
    pool.query('SELECT * FROM trends WHERE category = "crypto"', (error, trends) => {
        if (error) {
            console.error('Error getting crypto trends:', error);
            res.status(500).send('Error retrieving crypto trends');
            return;
        }
        res.render('investment', { user: req.session.user, trends: trends, category: 'Crypto' });
    });
};

module.exports = {
    getAllTrends,
    getStocks,
    getCrypto
};