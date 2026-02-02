const pool = require('../controllers/db'); // Use connection pool for better performance

const validateRegistration = (req, res, next) => {
    const { username, email, password, address, contact, role } = req.body;

    if (!username || !email || !password || !address || !contact || !role) {
        return res.status(400).send('All fields are required.');
    }
    
    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }
    next();
};

const register = (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    pool.query(sql, [username, email, password, address, contact, role], (err, result) => {
        if (err) {
            console.error('Registration error:', err);
            req.flash('error', 'Registration failed. Please try again.');
            return res.redirect('/register');
        }
        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.flash('error', 'Please enter email and password');
        return res.redirect('/login');
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
    pool.query(sql, [email, password], (err, results) => { 
        if (err) {
            console.error('Login error:', err);
            req.flash('error', 'Login failed. Please try again.');
            return res.redirect('/login');
        }
        if (results.length > 0) {
            req.session.user = results[0];
            req.flash('success', 'Login successful');
            if (req.session.user.role === 'admin') {
                res.redirect('/inventory');
            } else {
                res.redirect('/investment');
            }
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    });
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = {
    validateRegistration,
    register,
    login,
    logout
};