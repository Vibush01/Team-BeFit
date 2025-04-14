const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const authMiddleware = require('../middleware/auth');

// Submit a contact message
router.post('/', async (req, res, next) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const contactMessage = new ContactMessage({
            name,
            email,
            phone,
            subject,
            message,
        });

        await contactMessage.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        next(error);
    }
});

// Get all contact messages (Admin only)
router.get('/', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        next(error);
    }
});

// Delete a contact message (Admin only)
router.delete('/:id', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.deleteOne();
        res.json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;