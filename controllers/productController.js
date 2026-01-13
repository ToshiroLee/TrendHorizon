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

const updateTrend = (req, res) => {
    const trendId = req.params.id;
    const { name, description } = req.body;
    
    // Check if a new image was uploaded
    let updateQuery = 'UPDATE trends SET trendName = ?, description = ?';
    let queryParams = [name, description];
    
    if (req.file) {
        // If new image uploaded, include it in the update
        updateQuery += ', image = ?';
        queryParams.push(req.file.filename);
    }
    
    updateQuery += ' WHERE trendId = ?';
    queryParams.push(trendId);

    console.log('Updating trend with:', { name, description, image: req.file ? req.file.filename : 'no change' });

    // Function to attempt update with retry logic
    const attemptUpdate = (retryCount = 0) => {
        pool.getConnection((connErr, connection) => {
            if (connErr) {
                console.error("Error getting connection:", connErr);
                res.status(500).send('Database connection error');
                return;
            }

            connection.query(updateQuery, queryParams, (error, results) => {
                connection.release(); // Always release the connection
                
                if (error) {
                    console.error("Error updating trend:", error);
                    
                    // Handle lock timeout specifically
                    if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && retryCount < 3) {
                        console.log(`Lock timeout occurred, retrying... (attempt ${retryCount + 1}/3)`);
                        setTimeout(() => attemptUpdate(retryCount + 1), 1000); // Wait 1 second before retry
                        return;
                    }
                    
                    res.status(500).send('Error updating trend: ' + error.message);
                } else {
                    console.log('Trend updated successfully');
                    res.redirect('/inventory');
                }
            });
        });
    };

    attemptUpdate();
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
    updateTrend,
    deleteTrend,
    getTrend
};