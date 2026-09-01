import Employee from '../models/Employee.js';

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Protected
export const getAnalytics = async (req, res) => {
  try {
    // Total employees
    const totalEmployees = await Employee.countDocuments();

    // Average salary
    const salaryStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          averageSalary: { $avg: '$salary' },
          totalSalary: { $sum: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' }
        }
      }
    ]);

    // Employees by department
    const employeesByDepartment = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Salary distribution by department
    const salaryByDepartment = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          averageSalary: { $avg: '$salary' },
          totalSalary: { $sum: '$salary' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { averageSalary: -1 }
      }
    ]);

    // Recently added employees (last 10)
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email department position joinDate createdAt');

    // Salary range distribution
    const salaryRanges = await Employee.aggregate([
      {
        $bucket: {
          groupBy: '$salary',
          boundaries: [0, 30000, 50000, 75000, 100000, 150000, 200000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            employees: { $push: '$name' }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          averageSalary: salaryStats.length > 0 ? Math.round(salaryStats[0].averageSalary) : 0,
          totalSalary: salaryStats.length > 0 ? salaryStats[0].totalSalary : 0,
          minSalary: salaryStats.length > 0 ? salaryStats[0].minSalary : 0,
          maxSalary: salaryStats.length > 0 ? salaryStats[0].maxSalary : 0
        },
        employeesByDepartment: employeesByDepartment.map(dept => ({
          department: dept._id,
          count: dept.count
        })),
        salaryByDepartment: salaryByDepartment.map(dept => ({
          department: dept._id,
          averageSalary: Math.round(dept.averageSalary),
          totalSalary: dept.totalSalary,
          count: dept.count
        })),
        recentEmployees,
        salaryRanges: salaryRanges.map((range, index) => {
          const boundaries = [0, 30000, 50000, 75000, 100000, 150000, 200000, Infinity];
          return {
            range: `$${boundaries[index].toLocaleString()} - $${boundaries[index + 1] === Infinity ? '200k+' : boundaries[index + 1].toLocaleString()}`,
            count: range.count
          };
        })
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
};
