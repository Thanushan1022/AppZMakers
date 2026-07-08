import Faq from '../models/Faq.js';

export const getFaqs = async (req, res) => {
  try {
    const { targetRole } = req.query;
    const filter = targetRole ? { targetRole } : {};
    const faqs = await Faq.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    console.error('Error fetching FAQs:', err);
    res.status(500).json({ error: 'Server error fetching FAQs' });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, targetRole, order } = req.body;
    if (!question || !answer || !targetRole) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newFaq = new Faq({ question, answer, targetRole, order });
    await newFaq.save();
    res.status(201).json(newFaq);
  } catch (err) {
    console.error('Error creating FAQ:', err);
    res.status(500).json({ error: 'Server error creating FAQ' });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, targetRole, order } = req.body;

    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { question, answer, targetRole, order },
      { new: true }
    );
    if (!updatedFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json(updatedFaq);
  } catch (err) {
    console.error('Error updating FAQ:', err);
    res.status(500).json({ error: 'Server error updating FAQ' });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFaq = await Faq.findByIdAndDelete(id);
    if (!deletedFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    res.status(500).json({ error: 'Server error deleting FAQ' });
  }
};
