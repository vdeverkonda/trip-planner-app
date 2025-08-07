const express = require('express');
const { Budget, Expense } = require('../models/Budget');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');

const router = express.Router();

// Get budget for a trip
router.get('/trip/:tripId', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({ trip: req.params.tripId })
      .populate('participants.user', 'name email')
      .populate('expenses');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if user is part of the trip
    const trip = await Trip.findById(req.params.tripId);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Budget fetch error:', error);
    res.status(500).json({ message: 'Server error fetching budget' });
  }
});

// Update budget
router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if user has permission to update budget
    const trip = await Trip.findById(budget.trip);
    const userMember = trip.members.find(member => 
      member.user.toString() === req.userId
    );

    if (!userMember || (userMember.role !== 'admin' && trip.organizer.toString() !== req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('participants.user', 'name email');

    res.json({
      message: 'Budget updated successfully',
      budget: updatedBudget
    });
  } catch (error) {
    console.error('Budget update error:', error);
    res.status(500).json({ message: 'Server error updating budget' });
  }
});

// Add expense
router.post('/:budgetId/expenses', auth, async (req, res) => {
  try {
    const { title, description, amount, category, splitBetween, receipt, location } = req.body;
    
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if user is part of the trip
    const trip = await Trip.findById(budget.trip);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expense = new Expense({
      budget: budget._id,
      trip: budget.trip,
      title,
      description,
      amount,
      category,
      paidBy: req.userId,
      splitBetween: splitBetween || [],
      receipt,
      location
    });

    await expense.save();

    // Update budget spent amount for category
    if (budget.categories[category]) {
      budget.categories[category].spent += amount;
      await budget.save();
    }

    // Add expense to budget
    budget.expenses.push(expense._id);
    await budget.save();

    await expense.populate('paidBy', 'name email');
    await expense.populate('splitBetween.user', 'name email');

    res.status(201).json({
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('Expense creation error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
});

// Get expenses for a budget
router.get('/:budgetId/expenses', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if user is part of the trip
    const trip = await Trip.findById(budget.trip);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.find({ budget: req.params.budgetId })
      .populate('paidBy', 'name email')
      .populate('splitBetween.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Expenses fetch error:', error);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
});

// Update expense
router.put('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or has admin rights
    if (expense.paidBy.toString() !== req.userId) {
      const trip = await Trip.findById(expense.trip);
      const userMember = trip.members.find(member => 
        member.user.toString() === req.userId
      );

      if (!userMember || (userMember.role !== 'admin' && trip.organizer.toString() !== req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('paidBy', 'name email')
    .populate('splitBetween.user', 'name email');

    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Expense update error:', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or has admin rights
    if (expense.paidBy.toString() !== req.userId) {
      const trip = await Trip.findById(expense.trip);
      const userMember = trip.members.find(member => 
        member.user.toString() === req.userId
      );

      if (!userMember || (userMember.role !== 'admin' && trip.organizer.toString() !== req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Update budget spent amount
    const budget = await Budget.findById(expense.budget);
    if (budget && budget.categories[expense.category]) {
      budget.categories[expense.category].spent -= expense.amount;
      await budget.save();
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Expense deletion error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
});

// Get budget summary
router.get('/:budgetId/summary', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId)
      .populate('participants.user', 'name email');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Check if user is part of the trip
    const trip = await Trip.findById(budget.trip);
    const isMember = trip.members.some(member => 
      member.user.toString() === req.userId
    ) || trip.organizer.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate totals
    const totalBudgeted = Object.values(budget.categories).reduce((sum, cat) => sum + cat.budgeted, 0);
    const totalSpent = Object.values(budget.categories).reduce((sum, cat) => sum + cat.spent, 0);
    const remaining = totalBudgeted - totalSpent;

    // Calculate per-person breakdown
    const expenses = await Expense.find({ budget: req.params.budgetId });
    const personBreakdown = {};

    budget.participants.forEach(participant => {
      personBreakdown[participant.user._id] = {
        name: participant.user.name,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0
      };
    });

    expenses.forEach(expense => {
      const paidById = expense.paidBy.toString();
      if (personBreakdown[paidById]) {
        personBreakdown[paidById].totalPaid += expense.amount;
      }

      if (expense.splitBetween.length > 0) {
        expense.splitBetween.forEach(split => {
          const userId = split.user.toString();
          if (personBreakdown[userId]) {
            personBreakdown[userId].totalOwed += split.amount;
          }
        });
      } else {
        // Equal split among all participants
        const splitAmount = expense.amount / budget.participants.length;
        budget.participants.forEach(participant => {
          const userId = participant.user._id.toString();
          if (personBreakdown[userId]) {
            personBreakdown[userId].totalOwed += splitAmount;
          }
        });
      }
    });

    // Calculate balances
    Object.keys(personBreakdown).forEach(userId => {
      const person = personBreakdown[userId];
      person.balance = person.totalPaid - person.totalOwed;
    });

    res.json({
      totalBudgeted,
      totalSpent,
      remaining,
      categories: budget.categories,
      personBreakdown: Object.values(personBreakdown)
    });
  } catch (error) {
    console.error('Budget summary error:', error);
    res.status(500).json({ message: 'Server error generating budget summary' });
  }
});

module.exports = router;
