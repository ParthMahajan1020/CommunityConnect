const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validatePhone = (value) => /^\+?[0-9\s\-()]{7,20}$/.test(value.trim());

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            location,
            password
        } = req.body;

        const cleanedName = typeof name === 'string' ? name.trim() : '';
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const cleanedPhone = typeof phone === 'string' ? phone.trim() : '';
        const cleanedLocation = typeof location === 'string' ? location.trim() : '';
        const cleanedPassword = typeof password === 'string' ? password : '';

        if (
            !cleanedName ||
            !cleanedEmail ||
            !cleanedPhone ||
            !cleanedLocation ||
            !cleanedPassword
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!validateEmail(cleanedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        if (!validatePhone(cleanedPhone)) {
            return res.status(400).json({
                message: "Please enter a valid phone number"
            });
        }

        if (cleanedPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: cleanedEmail },
                { phone: cleanedPhone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email or phone number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(
            cleanedPassword,
            10
        );

        const user = await User.create({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            location: cleanedLocation,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password'
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
        res.status(500).json({
            message: 'Login failed',
            error: error.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};