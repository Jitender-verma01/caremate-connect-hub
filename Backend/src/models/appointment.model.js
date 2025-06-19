
import mongoose from "mongoose";
import { Schema } from "mongoose";

const appointmentSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    roomId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    consultationType: {
        type: String,
        required: true,
        enum: ['Video Consultation', 'Audio Call', 'In-Person']
    },
    timeSlot: {
        type: String,
        required: true // Format: "Monday 10:00 AM"
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed', 'in-progress'],
        default: 'scheduled'
    },
    sessionStart: { 
        type: Date 
    },
    sessionEnd: { 
        type: Date 
    },
    notes: {
        type: String
    }
}, { timestamps: true });

// Add index for better query performance
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
