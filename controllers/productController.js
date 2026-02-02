const pool = require('../controllers/db');

const addTrend = (req, res) => {
    const { name, image, category, description } = req.body;

    pool.query('INSERT INTO trends (trendName, image, category, description) VALUES (?, ?, ?, ?)', [name, image, category, description], (error, results) => {
        if (error) {
            console.error("Error adding trend:", error);
            res.status(500).send('Error adding trend');
        } else {
            if (category === 'stocks') {
                res.redirect('/inventory/stocks');
            } else if (category === 'crypto') {
                res.redirect('/inventory/crypto');
            } else {
                res.redirect('/inventory');
            }
        }
    });
};

const deleteTrend = (req, res) => {
    const trendId = req.params.id;

    pool.query('DELETE FROM trends WHERE trendId = ?', [trendId], (error, results) => {
        if (error) {
            console.error("Error deleting trend:", error);
            res.status(500).send('Error deleting trend');
        } else {
            res.redirect('/inventory');
        }
    });
};

const getTrend = (req, res) => {
    const trendId = req.params.id;

    pool.query('SELECT * FROM trends WHERE trendId = ?', [trendId], (error, results) => {
        if (error) {
            console.error("Error getting trend:", error);
            res.status(500).send('Error retrieving trend');
            return;
        }

        if (results.length > 0) {
            res.render('trend', { trend: results[0], user: req.session.user });
        } else {
            res.status(404).send('Trend not found');
        }
    });
};

module.exports = {
    addTrend,
    deleteTrend,
    getTrend
};