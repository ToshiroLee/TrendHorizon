const pool = require('./db');

// Get all users
const getAllUsers = (req, res) => {
    const sql = 'SELECT id as userId, username, email, address, contact, role as userRole FROM users ORDER BY id DESC';
    pool.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            req.flash('error', 'Failed to fetch users');
            return res.redirect('/inventory');
        }
        res.render('users', { 
            user: req.session.user, 
            users: results,
            messages: req.flash()
        });
    });
};

// Show add user form
const showAddUserForm = (req, res) => {
    res.render('register', { 
        messages: req.flash('error'), 
        formData: req.flash('formData')[0] || {},
        isUserManagement: true,
        user: req.session.user
    });
};

// Add new user (admin functionality)
const addUser = (req, res) => {
    const { username, email, password, address, contact, role } = req.body;

    // Validation
    if (!username || !email || !password || !address || !contact || !role) {
        req.flash('error', 'All fields are required.');
        req.flash('formData', req.body);
        return res.redirect('/users/add');
    }
    
    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/users/add');
    }

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';
    pool.query(sql, [username, email, password, address, contact, role], (error, result) => {
        if (error) {
            console.error('Error adding user:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                req.flash('error', 'Email already exists. Please use a different email.');
            } else {
                req.flash('error', 'Failed to add user. Please try again.');
            }
            req.flash('formData', req.body);
            return res.redirect('/users/add');
        }
        req.flash('success', 'User added successfully!');
        res.redirect('/users');
    });
};

// Show edit user form
const showEditUserForm = (req, res) => {
    const userId = req.params.id;
    
    const sql = 'SELECT * FROM users WHERE id = ?';
    pool.query(sql, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            req.flash('error', 'Failed to fetch user details');
            return res.redirect('/users');
        }
        
        if (results.length === 0) {
            req.flash('error', 'User not found');
            return res.redirect('/users');
        }
        
        res.render('editUser', { 
            user: req.session.user,
            editUser: results[0],
            messages: req.flash()
        });
    });
};

// Update user
const updateUser = (req, res) => {
    const userId = req.params.id;
    const { username, email, address, contact, role } = req.body;
    
    // Validation
    if (!username || !email || !address || !contact || !role) {
        req.flash('error', 'All fields are required.');
        return res.redirect(`/editUser/${userId}`);
    }
    
    const sql = 'UPDATE users SET username = ?, email = ?, address = ?, contact = ?, role = ? WHERE id = ?';
    pool.query(sql, [username, email, address, contact, role, userId], (error, result) => {
        if (error) {
            console.error('Error updating user:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                req.flash('error', 'Email already exists. Please use a different email.');
            } else {
                req.flash('error', 'Failed to update user. Please try again.');
            }
            return res.redirect(`/editUser/${userId}`);
        }
        
        if (result.affectedRows === 0) {
            req.flash('error', 'User not found');
            return res.redirect('/users');
        }
        
        req.flash('success', 'User updated successfully!');
        res.redirect('/users');
    });
};

// Delete user
const deleteUser = (req, res) => {
    const userId = req.params.id;
    
    // Prevent deleting the current logged-in user
    if (req.session.user.id == userId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/users');
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    pool.query(sql, [userId], (error, result) => {
        if (error) {
            console.error('Error deleting user:', error);
            req.flash('error', 'Failed to delete user. Please try again.');
            return res.redirect('/users');
        }
        
        if (result.affectedRows === 0) {
            req.flash('error', 'User not found');
        } else {
            req.flash('success', 'User deleted successfully!');
        }
        
        res.redirect('/users');
    });
};

module.exports = {
    getAllUsers,
    showAddUserForm,
    addUser,
    showEditUserForm,
    updateUser,
    deleteUser
};