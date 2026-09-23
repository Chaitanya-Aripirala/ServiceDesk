const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'technician', 'employee', 'asset_manager'],
      default: 'employee',
    },
    department: {
      type: String,
      enum: ['IT Support', 'Engineering', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Operations', 'Executive'],
      default: 'Engineering',
    },
    organization: {
      type: String,
      default: 'GlobalTech Enterprises',
    },
    jobTitle: {
      type: String,
      default: 'Team Member',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    location: {
      type: String,
      default: 'Building A, Floor 3',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specialties: [{
      type: String,
    }],
    assignedTicketCount: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
