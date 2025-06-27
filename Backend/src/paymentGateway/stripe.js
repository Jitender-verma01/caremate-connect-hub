import express from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const { doctorName, date, time, consultationType, userId, price, reason } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: price * 100, // Stripe uses cents
            product_data: {
              name: `Consultation with Dr. ${doctorName}`,
              description: `${consultationType} on ${date} at ${time}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CORS_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/book/${req.body.doctorId}?cancelled=true`,
      metadata: {
        doctorId: req.body.doctorId,
        userId,
        date,
        time,
        consultationType,
        reason
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/confirm-stripe-session", async (req, res) => {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ error: "Missing session_id" });
  
    const session = await stripe.checkout.sessions.retrieve(sessionId);
  
    if (session.payment_status === "paid") {
      // 🔥 Here you'd create the appointment in DB
      res.json({ status: "confirmed", metadata: session.metadata });
    } else {
      res.status(402).json({ status: "not_paid" });
    }
  });
  

export default router;
