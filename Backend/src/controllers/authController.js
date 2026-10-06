const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePhone = (value) => /^\+?[0-9\s\-()]{7,20}$/.test(value.trim());

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            location,
            password,
            confirmPassword
        } = req.body;

        const cleanedName = typeof name === 'string' ? name.trim() : '';
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const cleanedPhone = typeof phone === 'string' ? phone.trim() : '';
        const cleanedLocation = typeof location === 'string' ? location.trim() : '';
        const cleanedPassword = typeof password === 'string' ? password : '';
        const cleanedConfirmPassword = typeof confirmPassword === 'string' ? confirmPassword : '';

        if (!cleanedName || !cleanedEmail || !cleanedPhone || !cleanedLocation || !cleanedPassword || !cleanedConfirmPassword) {
            return res.status(400).json({
                message: 'All fields are required.'
            });
        }

        if (!validateEmail(cleanedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.'
            });
        }

        if (!validatePhone(cleanedPhone)) {
            return res.status(400).json({
                message: 'Please enter a valid phone number.'
            });
        }

        if (cleanedPassword.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long.'
            });
        }

        if (cleanedPassword !== cleanedConfirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match.'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: cleanedEmail },
                { phone: cleanedPhone }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'This email or phone number is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(cleanedPassword, 12);
        await User.create({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            location: cleanedLocation,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: 'Account created successfully.'
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({
            message: 'Login failed. Please try again.'
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};