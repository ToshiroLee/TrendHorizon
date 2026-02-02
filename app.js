const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const xlsx = require('xlsx'); // Add this line
const multer = require('multer'); // Add multer for file uploads
const path = require('path'); // Add path for file extensions
const app = express();

const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const inventoryController = require('./controllers/inventoryController');
const investmentController = require('./controllers/investmentController');
const userController = require('./controllers/userController');

const connection = require('./controllers/db'); // Assuming you have a db.js file for MySQL connection

// Set up view engine
app.set('view engine', 'ejs');
// Enable static files
app.use(express.static('public'));
// Enable form processing
app.use(express.urlencoded({ extended: false }));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/') // Store files in public/images directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique filename
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Session Middleware
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(flash());

// Middleware to check if user is logged in
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        console.log('User is authenticated:', req.session.user);
        return next();
    } else {
        console.log('User is not authenticated');
        req.flash('error', 'Please log in to view this page');
        res.redirect('/login');
    }
};

//Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.session.user.role === 'admin') {
        console.log('User is admin:', req.session.user);
        return next();
    } else {
        console.log('User is not admin');
        req.flash('error', 'Access denied');
        res.redirect('/login');
    }
};

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Chart route
app.get('/chart', checkAuthenticated, (req, res) => {
    res.render('chart', { user: req.session.user });
});

// Auth routes
app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});
app.post('/register', authController.validateRegistration, authController.register);
app.get('/login', (req, res) => {
    res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
});
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// Trend routes
app.get('/trend/:id', checkAuthenticated, productController.getTrend);
app.get('/trend', checkAuthenticated, checkAdmin, (req, res) => {
    res.render('addTrend', { user: req.session.user });
});
app.post('/trend', productController.addTrend);
app.get('/trend/:id/delete', productController.deleteTrend);


// Inventory routes
app.get('/inventory', checkAuthenticated, checkAdmin, inventoryController.getAllTrends);
app.get('/inventory/stocks', checkAuthenticated, checkAdmin, inventoryController.getStocks);
app.get('/inventory/crypto', checkAuthenticated, checkAdmin, inventoryController.getCrypto);

// Investment routes
app.get('/investment', checkAuthenticated, investmentController.getAllTrends);
app.get('/investment/stocks', checkAuthenticated, investmentController.getStocks);
app.get('/investment/crypto', checkAuthenticated, investmentController.getCrypto);

// User management routes (Admin only)
app.get('/users', checkAuthenticated, checkAdmin, userController.getAllUsers);
app.get('/users/add', checkAuthenticated, checkAdmin, userController.showAddUserForm);
app.post('/users/add', checkAuthenticated, checkAdmin, userController.addUser);
app.get('/editUser/:id', checkAuthenticated, checkAdmin, userController.showEditUserForm);
app.post('/editUser/:id', checkAuthenticated, checkAdmin, userController.updateUser);
app.post('/deleteUser/:id', checkAuthenticated, checkAdmin, userController.deleteUser);

// API route for chart data (accessible to authenticated users)
app.get('/api/chart-data', checkAuthenticated, (req, res) => {
    const stockName = req.query.stock || 'Nvidia'; // Default to Nvidia
    const validStocks = ['Nvidia', 'Tesla', 'Apple', 'DBS', 'Grab'];
    
    console.log('API called with stock:', stockName); // Debug log
    
    // Validate stock name to prevent SQL injection
    if (!validStocks.includes(stockName)) {
        return res.status(400).json({ error: 'Invalid stock name' });
    }
    
    const query = `SELECT Time, \`${stockName}\` as stockValue FROM stock ORDER BY STR_TO_DATE(CONCAT('2026-01-27 ', Time), '%Y-%m-%d %h:%i:%s %p') ASC`;
    console.log('Executing query:', query); // Debug log
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ error: error.message });
        }
        console.log('Query results for', stockName, ':', results); // Debug log
        // Map the results to have 'date' and 'stock' keys
        const mappedResults = results.map(row => ({
            date: row.Time,
            stock: row.stockValue
        }));
        console.log('Sending mapped results:', mappedResults); // Debug log
        res.json(mappedResults);
    });
});

// API route for crypto chart data
app.get('/api/crypto-data', checkAuthenticated, (req, res) => {
    const cryptoName = req.query.crypto || 'Bitcoin'; // Default to Bitcoin
    const validCryptos = ['Bitcoin', 'Ethereum', 'Solana', 'Ripple', 'Cardano'];
    
    console.log('Crypto API called with:', cryptoName);
    
    // Validate crypto name to prevent SQL injection
    if (!validCryptos.includes(cryptoName)) {
        return res.status(400).json({ error: 'Invalid crypto name' });
    }
    
    const query = `SELECT Time, \`${cryptoName}\` as cryptoValue FROM crypto_prices ORDER BY STR_TO_DATE(CONCAT('2026-01-27 ', Time), '%Y-%m-%d %H:%i') ASC`;
    console.log('Executing crypto query:', query);
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Crypto query error:', error);
            return res.status(500).json({ error: error.message });
        }
        console.log('Crypto query results for', cryptoName, ':', results.length, 'rows'); // Debug log
        
        // Filter out rows where cryptoValue is null or undefined
        const filteredResults = results.filter(row => row.cryptoValue !== null && row.cryptoValue !== undefined);
        console.log('Filtered crypto results:', filteredResults.length, 'rows');
        
        const mappedResults = filteredResults.map(row => {
            let value = row.cryptoValue;
            
            // Handle different value formats
            if (typeof value === 'string') {
                // Remove dollar sign if present and any whitespace
                value = value.replace(/[$\s,]/g, '');
            }
            
            // Convert to float, defaulting to 0 if invalid
            const numericValue = parseFloat(value) || 0;
            
            return {
                date: row.Time,
                value: numericValue
            };
        });
        console.log('Sending crypto mapped results:', mappedResults); // Debug log
        res.json(mappedResults);
    });
});

// API route for multiline stock data
app.get('/api/multiline-stock-data', checkAuthenticated, (req, res) => {
    console.log('Multiline stock API called');
    
    const query = 'SELECT Time, Nvidia, Tesla, Apple, DBS, Grab FROM stock ORDER BY STR_TO_DATE(CONCAT(\'2026-01-27 \', Time), \'%Y-%m-%d %h:%i:%s %p\') ASC';
    console.log('Executing multiline stock query:', query);
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Multiline stock query error:', error);
            return res.status(500).json({ error: error.message });
        }
        console.log('Multiline stock query results:', results.length, 'rows');
        res.json(results);
    });
});

// API route for multiline crypto data
app.get('/api/multiline-crypto-data', checkAuthenticated, (req, res) => {
    console.log('Multiline crypto API called');
    
    const query = 'SELECT Time, Bitcoin, Ethereum, Solana, Ripple, Cardano FROM crypto_prices ORDER BY STR_TO_DATE(CONCAT(\'2026-01-27 \', Time), \'%Y-%m-%d %H:%i\') ASC';
    console.log('Executing multiline crypto query:', query);
    
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Multiline crypto query error:', error);
            return res.status(500).json({ error: error.message });
        }
        console.log('Multiline crypto query results:', results.length, 'rows');
        
        // Clean up the data to ensure numeric values
        const cleanedResults = results.map(row => {
            const cleanedRow = { Time: row.Time };
            ['Bitcoin', 'Ethereum', 'Solana', 'Ripple', 'Cardano'].forEach(crypto => {
                let value = row[crypto];
                if (typeof value === 'string') {
                    value = value.replace(/[$\s,]/g, '');
                }
                cleanedRow[crypto] = parseFloat(value) || 0;
            });
            return cleanedRow;
        });
        
        console.log('Sending cleaned multiline crypto results:', cleanedResults.length, 'rows');
        res.json(cleanedResults);
    });
});

// Route to generate sales report
app.get('/generate-sales-report', checkAuthenticated, checkAdmin, (req, res) => {
    connection.query('SELECT * FROM sales', (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Internal Server Error');
        }

        console.log('Sales data fetched:', results); // Log the fetched data

        if (results.length === 0) {
            console.log('No sales data found');
            return res.status(404).send('No sales data found');
        }

        try {
            // Create a new workbook and worksheet
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(results);

            // Append the worksheet to the workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

            // Write the workbook to a buffer
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            // Set the response headers and send the buffer
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (err) {
            console.error('Error generating Excel file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));