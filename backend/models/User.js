//backend/models/User.js
//backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,

        validate: {
            validator: function (value) {

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                return emailRegex.test(value);
            },

            message: 'Please enter a valid email address'
        }
    },

    password: {
        type: String,
        required: true,

        validate: {
            validator: function (value) {

                // No spaces allowed
                if (/\s/.test(value)) {
                    return false;
                }

                // Minimum 8 chars
                // 1 uppercase
                // 1 lowercase
                // 1 number
                // 1 special character

                const passwordRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

                return passwordRegex.test(value);
            },

            message:
                'Password must contain minimum 8 characters, uppercase, lowercase, number, special character, and no spaces'
        }
    },

    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        default: 'student'
    },

    studentId: {
        type: String,

        validate: {
            validator: function (value) {

                // Allow empty for faculty/admin
                if (!value) return true;

                // Only digits and max 6 digits
                return /^\d{1,6}$/.test(value);
            },

            message:
                'Student ID must contain only numbers and maximum 6 digits'
        }
    },

    department: {
        type: String,
        default: ''
    },

    semester: {
        type: Number,

        validate: {
            validator: function (value) {

                if (
                    value === undefined ||
                    value === null
                ) {
                    return true;
                }

                return value >= 1 && value <= 8;
            },

            message:
                'Semester must be between 1 and 8'
        }
    },

    enrolledClasses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        }
    ]
},
{
    timestamps: true
}
);

// HASH PASSWORD BEFORE SAVING
userSchema.pre('save', async function (next) {

if (!this.isModified('password')) {
    return next();
}

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});

// MATCH PASSWORD
userSchema.methods.matchPassword =
async function (enteredPassword) {

    return await bcrypt.compare(
        enteredPassword,
        this.password
    );
};

export default mongoose.model('User', userSchema);