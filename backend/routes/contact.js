const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

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

module.exports = router;