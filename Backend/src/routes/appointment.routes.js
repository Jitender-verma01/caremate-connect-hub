
import {Router} from "express";
import {createAppointment, getAppointmentById, getAllAppointmentsForPatient, getAllAppointmentsForDoctor, cancelAppointment, updateAppointmentStatus} from "../controllers/appointment.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createAppointment);

router.route("/:appointmentId").get(getAppointmentById);
router.route("/patient/:patientId").get(getAllAppointmentsForPatient);
router.route("/doctor/:doctorId").get(getAllAppointmentsForDoctor);

router.route("/cancel/:appointmentId").patch(cancelAppointment);
router.route("/update/:appointmentId").patch(updateAppointmentStatus);


export default router;
