import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Employee from './models/Employee.js';

dotenv.config();

// Sample admin credentials
const adminData = {
  username: 'admin',
  email: 'admin@ems.com',
  password: 'admin123',
  role: 'admin'
};

// Sample employee data
const employeesData = [
  {
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    salary: 95000,
    joinDate: new Date('2022-01-15')
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'HR',
    position: 'HR Manager',
    salary: 75000,
    joinDate: new Date('2021-06-20')
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    department: 'Sales',
    position: 'Sales Representative',
    salary: 55000,
    joinDate: new Date('2023-03-10')
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    department: 'Marketing',
    position: 'Marketing Specialist',
    salary: 62000,
    joinDate: new Date('2022-08-05')
  },
  {
    name: 'David Brown',
    email: 'david.brown@company.com',
    department: 'Finance',
    position: 'Financial Analyst',
    salary: 72000,
    joinDate: new Date('2021-11-12')
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 85000,
    joinDate: new Date('2023-01-08')
  },
  {
    name: 'Robert Miller',
    email: 'robert.miller@company.com',
    department: 'Operations',
    position: 'Operations Manager',
    salary: 82000,
    joinDate: new Date('2020-09-25')
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
    salary: 92000,
    joinDate: new Date('2022-05-18')
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    department: 'Sales',
    position: 'Sales Manager',
    salary: 88000,
    joinDate: new Date('2021-02-14')
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    department: 'Marketing',
    position: 'Content Marketing Manager',
    salary: 70000,
    joinDate: new Date('2023-07-22')
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Employee.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Hash admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    await Admin.create({
      ...adminData,
      password: hashedPassword
    });
    console.log('👤 Admin created successfully');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);

    // Create employees
    await Employee.insertMany(employeesData);
    console.log(`👥 ${employeesData.length} employees created successfully`);

    console.log('\n✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
