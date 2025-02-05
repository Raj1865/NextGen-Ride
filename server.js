const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // ✅ This serves index.html

// Route for checking balance
app.post("/checkBalance", async (req, res) => {
    const { registerNumber, distance } = req.body;

    if (!registerNumber || isNaN(distance) || distance > 10) {
        return res.status(400).json({ message: "Invalid input!" });
    }

    try {
        console.log(`🔍 Checking student with register number: ${registerNumber}`);

        const student = await db.getStudent(registerNumber);
        if (!student) {
            console.log("❌ Student not found in database");
            return res.status(404).json({ message: "Register number not found!" });
        }

        let fare = Math.min(distance * 2.5, 25);
        let newBalance = student.AVAILABLE_BALANCE - fare;

        if (newBalance < 0) {
            console.log("❌ Insufficient balance");
            return res.status(400).json({ message: "Insufficient balance!" });
        }

        console.log(`✅ Deducting ₹${fare}, new balance: ₹${newBalance}`);
        await db.updateBalance(registerNumber, newBalance);

        res.json({
            message: `Hello ${student.NAME}, ₹${fare} deducted. Remaining balance: ₹${newBalance}`,
        });

    } catch (error) {
        console.error("🔥 Server error:", error);
        res.status(500).json({ message: "Server error!", error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});