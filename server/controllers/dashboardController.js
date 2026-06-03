import Job from '../models/Job.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get today's range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Get month range
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Jobs Created Today
    const jobsTodayCount = await Job.countDocuments({
      userId,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    // 2. Revenue This Month (only paid/completed transactions)
    const monthJobs = await Job.find({
      userId,
      status: 'paid',
      createdAt: { $gte: startOfMonth }
    });
    const revenueThisMonth = monthJobs.reduce((sum, job) => sum + job.totalBill, 0);

    // 3. Pending Bills (unpaid jobs count)
    const pendingInvoicesCount = await Job.countDocuments({
      userId,
      status: 'unpaid'
    });

    // 4. Follow-up Alerts (draft jobs or unpaid jobs older than 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const followUpsCount = await Job.countDocuments({
      userId,
      status: 'unpaid',
      createdAt: { $lt: threeDaysAgo }
    });

    // 5. Chart Data: Weekly Revenue representation
    // Let's compute actual aggregates for the last 7 days dynamically
    const chartData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayJobs = await Job.find({
        userId,
        status: 'paid',
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const dayRevenue = dayJobs.reduce((sum, job) => sum + job.totalBill, 0);
      chartData.push({ day: dayName, revenue: dayRevenue });
    }

    res.json({
      jobsToday: jobsTodayCount,
      revenueThisMonth,
      pendingInvoices: pendingInvoicesCount,
      followUps: followUpsCount,
      chartData
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(500).json({ message: 'Server failed to calculate dashboard stats' });
  }
};
