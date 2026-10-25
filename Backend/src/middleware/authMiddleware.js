const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'User account not found'
            });
        }

        if (user.accountStatus === 'SUSPENDED') {
            return res.status(403).json({
                message: 'Your account has been suspended by an administrator.',
                accountStatus: 'SUSPENDED'
            });
        }

        req.userId = user._id;
        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of roles: [${roles.join(', ')}]`,
                userRole: req.user.role
            });
        }

        next();
    };
};

const requireApprovedOrg = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const orgRoles = ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'];
    if (!orgRoles.includes(req.user.role)) {
        return res.status(403).json({
            message: 'Access restricted to registered organizations.',
            userRole: req.user.role
        });
    }

    if (req.user.organizationStatus !== 'APPROVED') {
        const statusMessages = {
            PENDING: 'Your organization account is currently pending administrator verification.',
            REJECTED: 'Your organization account application was rejected.',
            SUSPENDED: 'Your organization account has been suspended.'
        };

        return res.status(403).json({
            message: statusMessages[req.user.organizationStatus] || 'Organization is not authorized for operational features.',
            organizationStatus: req.user.organizationStatus,
            requiresApproval: true
        });
    }

    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            message: 'Forbidden. Administrator credentials required.',
            userRole: req.user.role
        });
    }

    next();
};

authMiddleware.authMiddleware = authMiddleware;
authMiddleware.requireRole = requireRole;
authMiddleware.requireApprovedOrg = requireApprovedOrg;
authMiddleware.requireAdmin = requireAdmin;

module.exports = authMiddleware;
