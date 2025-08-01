import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApiError } from "./utils/ApiError.js";

const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://d7f9259f-d9b3-4e4a-ad41-f123ef935886.lovableproject.com",
  "https://id-preview--d7f9259f-d9b3-4e4a-ad41-f123ef935886.lovable.app",
  "http://localhost:8080",
  "https://caremate-gules.vercel.app",
  "https://care-mate-bice.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if(!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//import routes
import userRouter from "./routes/user.routes.js"
import patientRouter from "./routes/patient.routes.js"
import doctorRouter from "./routes/doctor.routes.js"
import appointmentRouter from "./routes/appointment.routes.js"
import prescriptionRouter from "./routes/prescription.routes.js"
import medicalRecordsRouter from "./routes/medicalRecords.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import stripe from "./paymentGateway/stripe.js";

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/patient", patientRouter)
app.use("/api/v1/doctor", doctorRouter)
app.use("/api/v1/appointment", appointmentRouter)
app.use("/api/v1/prescription", prescriptionRouter)
app.use("/api/v1/medicalRecords", medicalRecordsRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/payment", stripe)

//middleware for sending error as json response
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: err.success,
        message: err.message,
        errors: err.errors
      });
    }
    console.error(err);
    //for errors which are not defined
    return res.status(500).json({
      success: false,
      message: 'Something went wrong on the server',
      errors: []
    });
  });

export { app }
