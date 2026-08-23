const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

console.log("🔥 THIS SERVER.JS IS RUNNING 🔥");
const app = express();
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("NO VALID AUTHORIZATION HEADER");

      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN RECEIVED:", token ? "YES" : "NO");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED TOKEN:", decoded);

    const [users] = await db.query(
      "SELECT id, role FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log("USER NOT FOUND:", decoded.userId);

      return res.status(401).json({
        message: "User not found.",
      });
    }

    console.log("ADMIN USER:", users[0]);

    if (users[0].role !== "admin") {
      console.log(
        "USER IS NOT ADMIN. ROLE:",
        users[0].role
      );

      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.admin = users[0];

    next();

  } catch (error) {
    console.error(
      "ADMIN AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Invalid or expired authentication token.",
    });
  }
};


// ======================================================
// HOME / SERVER TEST
// ======================================================

app.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS connected"
    );

    res.json({
      message: "Andre Royal Invest API is running!",
      database:
        rows[0].connected === 1
          ? "Connected"
          : "Not connected",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});


// ======================================================
// REGISTER
// ======================================================

app.post("/api/register", async (req, res) => {
  try {

    const {
      full_name,
      email,
      phone,
      password,
      referral_code
    } = req.body;


    if (
      !full_name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill in all fields."
      });
    }


    // --------------------------------------------------
    // Check existing email or phone
    // --------------------------------------------------

    const [existingUsers] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      OR phone = ?
      `,
      [email, phone]
    );


    if (existingUsers.length > 0) {
      return res.status(409).json({
        message:
          "An account with that email or phone already exists."
      });
    }


    // --------------------------------------------------
    // Find referrer
    // --------------------------------------------------

    let referredBy = null;


    if (referral_code) {

      const [referrer] = await db.query(
        `
        SELECT id
        FROM users
        WHERE referral_code = ?
        `,
        [referral_code]
      );


      if (referrer.length > 0) {
        referredBy = referrer[0].id;
      }
    }


    // --------------------------------------------------
    // Generate unique referral code
    // --------------------------------------------------

    let newReferralCode;
    let codeExists = true;


    while (codeExists) {

      newReferralCode =
        "AR" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();


      const [existingCode] = await db.query(
        `
        SELECT id
        FROM users
        WHERE referral_code = ?
        `,
        [newReferralCode]
      );


      codeExists =
        existingCode.length > 0;
    }


    // --------------------------------------------------
    // Hash password
    // --------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // --------------------------------------------------
    // Create account
    //
    // Welcome bonus:
    // UGX 2,000
    // Credited immediately
    // --------------------------------------------------

    const [result] = await db.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        phone,
        password,
        referral_code,
        referred_by,
        welcome_bonus,
        welcome_bonus_unlocked,
        welcome_bonus_used,
        welcome_bonus_remaining
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        full_name,
        email,
        phone,
        hashedPassword,
        newReferralCode,
        referredBy,
        2000.00,
        1,
        0,
        2000.00
      ]
    );


    res.status(201).json({
      message:
        "Account created successfully.",

      user_id:
        result.insertId,

      referral_code:
        newReferralCode,

      welcome_bonus:
        2000,

      welcome_bonus_unlocked:
        true,

      welcome_bonus_used:
        false,

      welcome_bonus_remaining:
        2000
    });


  } catch (error) {

    console.error(error);


    res.status(500).json({
      message:
        "Unable to create account."
    });
  }
});

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }


    const [users] = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = ?
      `,
      [email]
    );


    if (users.length === 0) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }


    const user = users[0];


    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }


    const token =
      jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );


    res.json({
      message:
        "Login successful.",

      token: token,

      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to login.",
    });
  }
});


// ======================================================
// INVESTMENT PLANS
// ======================================================

app.get(
  "/api/investment-plans",
  async (req, res) => {

    try {

      const [plans] =
        await db.query(
          `
          SELECT
            id,
            name,
            investment_amount,
            stated_daily_return,
            period_days
          FROM investment_plans
          ORDER BY investment_amount ASC
          `
        );


      res.json(plans);


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load investment plans.",
      });
    }
  }
);


// ======================================================
// DEMO INVESTMENT
// ======================================================

app.post(
  "/api/demo-investments",
  async (req, res) => {

    try {

      const {
        user_id,
        plan_id
      } = req.body;


      if (!user_id || !plan_id) {
        return res.status(400).json({
          message:
            "User and plan are required.",
        });
      }


      const [plans] =
        await db.query(
          `
          SELECT *
          FROM investment_plans
          WHERE id = ?
          `,
          [plan_id]
        );


      if (plans.length === 0) {
        return res.status(404).json({
          message:
            "Investment plan not found.",
        });
      }


      const plan =
        plans[0];


      const [result] =
        await db.query(
          `
          INSERT INTO investments
          (
            user_id,
            plan_id,
            amount,
            start_date,
            end_date,
            status
          )
          VALUES
          (
            ?,
            ?,
            ?,
            NOW(),
            DATE_ADD(NOW(), INTERVAL ? DAY),
            'demo'
          )
          `,
          [
            user_id,
            plan.id,
            plan.investment_amount,
            plan.period_days,
          ]
        );


      await db.query(
        `
        INSERT INTO transactions
        (
          user_id,
          investment_id,
          type,
          amount,
          description,
          status
        )
        VALUES
        (
          ?,
          ?,
          'investment',
          ?,
          ?,
          'demo'
        )
        `,
        [
          user_id,
          result.insertId,
          plan.investment_amount,
          "Demo investment in " + plan.name,
        ]
      );


      res.json({
        message:
          "Demo investment created successfully.",

        investment_id:
          result.insertId,
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to create demo investment.",
      });
    }
  }
);


// ======================================================
// MY INVESTMENTS
// ======================================================

app.get(
  "/api/my-investments/:userId",
  async (req, res) => {

    try {

      const {
        userId
      } = req.params;


      const [investments] =
        await db.query(
          `
          SELECT
            investments.*,
            investment_plans.name,
            investment_plans.stated_daily_return,
            investment_plans.period_days
          FROM investments
          JOIN investment_plans
            ON investments.plan_id =
               investment_plans.id
          WHERE investments.user_id = ?
          `,
          [userId]
        );


      res.json(investments);


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load investments.",
      });
    }
  }
);


// ======================================================
// PENDING DEPOSITS - ADMIN
// ======================================================

app.get(
  "/api/pending-deposits",
  requireAdmin,
  async (req, res) => {

    try {

      const [deposits] =
        await db.query(
          `
          SELECT
            deposits.id,
            deposits.user_id,
            deposits.plan_id,
            deposits.amount,
            deposits.phone_number,
            deposits.status,
            deposits.created_at,
            users.full_name,
            investment_plans.name AS plan_name
          FROM deposits
          JOIN users
            ON deposits.user_id =
               users.id
          JOIN investment_plans
            ON deposits.plan_id =
               investment_plans.id
          WHERE deposits.status = 'pending'
          ORDER BY deposits.created_at DESC
          `
        );


      res.json({
        deposits
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load pending deposits.",
      });
    }
  }
);


// ======================================================
// PENDING WITHDRAWALS - ADMIN
// ======================================================

app.get(
  "/api/pending-withdrawals",
  async (req, res) => {

    try {

      const [withdrawals] =
        await db.query(
          `
          SELECT
            w.id,
            w.user_id,
            w.phone_number,
            w.amount,
            w.charge,
            w.net_amount,
            w.status,
            w.created_at,
            u.full_name,
            u.email
          FROM withdrawals w
          JOIN users u
            ON w.user_id = u.id
          WHERE w.status = 'pending'
          ORDER BY w.created_at ASC
          `
        );


      res.json({
        withdrawals
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load pending withdrawals."
      });
    }
  }
);


// ======================================================
// APPROVED WITHDRAWALS - ADMIN
// ======================================================

app.get(
  "/api/approved-withdrawals",
  async (req, res) => {

    try {

      const [withdrawals] =
        await db.query(
          `
          SELECT
            w.id,
            w.user_id,
            w.phone_number,
            w.amount,
            w.charge,
            w.net_amount,
            w.status,
            w.created_at,
            u.full_name,
            u.email
          FROM withdrawals w
          JOIN users u
            ON w.user_id = u.id
          WHERE w.status = 'approved'
          ORDER BY w.created_at DESC
          `
        );


      res.json({
        withdrawals
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load approved withdrawals."
      });
    }
  }
);


// ======================================================
// APPROVE WITHDRAWAL
// ======================================================

// ======================================================
// APPROVE WITHDRAWAL
// ======================================================

app.post("/api/approve-withdrawal", async (req, res) => {
  try {
    const { withdrawal_id } = req.body;

    console.log("🟢 Approving withdrawal ID:", withdrawal_id);

    // =================================================
    // CHECK WITHDRAWAL ID
    // =================================================

    if (!withdrawal_id) {
      return res.status(400).json({
        message: "Withdrawal ID is required."
      });
    }

    // =================================================
    // GET PENDING WITHDRAWAL
    // =================================================

    const [withdrawalResult] = await db.query(
      `
      SELECT id, user_id, amount, status
      FROM withdrawals
      WHERE id = ? AND status = 'pending'
      `,
      [withdrawal_id]
    );

    console.log("📦 Withdrawal result:", withdrawalResult);

    if (withdrawalResult.length === 0) {
      return res.status(400).json({
        message: "Withdrawal not found or already processed."
      });
    }

    const withdrawal = withdrawalResult[0];
    const userId = withdrawal.user_id;
    const withdrawalAmount = Number(withdrawal.amount || 0);

    console.log("👤 User ID:", userId);
    console.log("💰 Withdrawal Amount:", withdrawalAmount);

    // =================================================
    // GET USER BONUS INFORMATION
    // =================================================

    const [userResult] = await db.query(
      `
      SELECT welcome_bonus, welcome_bonus_remaining, welcome_bonus_used
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    let welcomeBonusRemaining = Number(userResult[0].welcome_bonus_remaining || 0);
    console.log("🎁 Welcome bonus remaining:", welcomeBonusRemaining);

    // =================================================
    // GET ACTIVE INVESTMENTS
    // =================================================

    const [investments] = await db.query(
      `
      SELECT i.start_date, p.stated_daily_return, p.period_days
      FROM investments i
      JOIN investment_plans p ON i.plan_id = p.id
      WHERE i.user_id = ? AND i.status = 'active'
      `,
      [userId]
    );

    console.log("📊 Active investments found:", investments.length);

    // =================================================
    // CALCULATE INVESTMENT EARNINGS
    // =================================================

    let investmentEarnings = 0;
    const now = new Date();

    investments.forEach((investment) => {
      const dailyReturn = Number(investment.stated_daily_return || 0);
      const periodDays = Number(investment.period_days || 0);
      const startDate = new Date(investment.start_date);

      const elapsedMilliseconds = now.getTime() - startDate.getTime();
      const completeDays = Math.floor(elapsedMilliseconds / (1000 * 60 * 60 * 24));
      const earnedDays = Math.min(Math.max(completeDays, 0), periodDays);

      investmentEarnings += earnedDays * dailyReturn;
    });

    console.log("💰 Investment earnings:", investmentEarnings);

    // =================================================
    // REFERRAL EARNINGS
    // =================================================

    const [referralResult] = await db.query(
      `
      SELECT COALESCE(SUM(commission_amount), 0) AS referral_earnings
      FROM referral_commissions
      WHERE user_id = ?
      `,
      [userId]
    );

    const referralEarnings = Number(referralResult[0].referral_earnings || 0);
    console.log("👥 Referral earnings:", referralEarnings);

    // =================================================
    // TOTAL NORMAL EARNINGS
    // =================================================

    const totalEarnings = investmentEarnings + referralEarnings;
    console.log("📈 Total earnings:", totalEarnings);

    // =================================================
    // PREVIOUS APPROVED WITHDRAWALS
    // =================================================

    const [previousWithdrawals] = await db.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS withdrawn_amount
      FROM withdrawals
      WHERE user_id = ? AND id != ? AND status = 'approved'
      `,
      [userId, withdrawal_id]
    );

    const withdrawnAmount = Number(previousWithdrawals[0].withdrawn_amount || 0);
    console.log("💸 Previous withdrawn amount:", withdrawnAmount);

    // =================================================
    // AVAILABLE BALANCE
    // =================================================

    const normalAvailableBalance = Math.max(totalEarnings - withdrawnAmount, 0);
    const availableBalance = normalAvailableBalance + welcomeBonusRemaining;

    console.log("💰 Available balance:", availableBalance);

    // =================================================
    // CHECK BALANCE
    // =================================================

    if (withdrawalAmount > availableBalance) {
      return res.status(400).json({
        message: `Insufficient balance. Available: UGX ${availableBalance.toLocaleString()}`
      });
    }

    // =================================================
    // APPROVE WITHDRAWAL
    // =================================================

    console.log("🔄 Attempting to update withdrawal...");

    await db.query(
      `
      UPDATE withdrawals
      SET status = 'approved'
      WHERE id = ? AND status = 'pending'
      `,
      [withdrawal_id]
    );

    console.log("✅ Withdrawal updated successfully!");

    // =================================================
    // DEDUCT WELCOME BONUS (FIXED)
    // =================================================

    let bonusUsedForWithdrawal = 0;

    if (welcomeBonusRemaining > 0) {
      bonusUsedForWithdrawal = Math.min(welcomeBonusRemaining, withdrawalAmount);
      welcomeBonusRemaining -= bonusUsedForWithdrawal;

      console.log("🎁 Deducting bonus:", bonusUsedForWithdrawal);
      console.log("🎁 Remaining bonus:", welcomeBonusRemaining);

      // FIXED: Just set the remaining bonus, don't track cumulative used
      await db.query(
        `
        UPDATE users
        SET welcome_bonus_remaining = ?,
            welcome_bonus_used = 1  -- Mark as used (1 = used, 0 = not used)
        WHERE id = ?
        `,
        [welcomeBonusRemaining, userId]
      );
    }

    // =================================================
    // CALCULATE REMAINING BALANCE
    // =================================================

    const remainingBalance = Math.max(availableBalance - withdrawalAmount, 0);

    // =================================================
    // SUCCESS
    // =================================================

    console.log("🎉 Withdrawal approved successfully!");

    res.json({
      message: "Withdrawal approved successfully.",
      withdrawal_amount: withdrawalAmount,
      bonus_used: bonusUsedForWithdrawal,
      welcome_bonus_remaining: welcomeBonusRemaining,
      remaining_balance: remainingBalance
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);

    res.status(500).json({
      message: "Unable to approve withdrawal.",
      error: error.message
    });
  }
});
// ======================================================
// USER MONITORING - ADMIN
// ======================================================

app.get(
  "/api/admin/user-monitoring",
  requireAdmin,
  async (req, res) => {
    console.log("USER MONITORING ROUTE WAS CALLED");

    try {
      // ==========================================
      // GET ALL USERS
      // ==========================================

      const [users] = await db.query(
        `
        SELECT
          id,
          full_name,
          phone,
          email,
          created_at
        FROM users
        ORDER BY id ASC
        `
      );

      console.log(
        "Users found for monitoring:",
        users.length
      );

      // ==========================================
      // CALCULATE MONITORING DATA
      // ==========================================

      const monitoringData = [];

      for (const user of users) {

        // ========================================
        // INVESTMENTS
        // ========================================

        const [investments] = await db.query(
          `
          SELECT
            i.amount,
            i.start_date,
            p.stated_daily_return,
            p.period_days
          FROM investments i
          JOIN investment_plans p
            ON i.plan_id = p.id
          WHERE i.user_id = ?
          `,
          [user.id]
        );

        let totalInvestment = 0;
        let investmentEarnings = 0;

        const now = new Date();

        investments.forEach((investment) => {

          const amount =
            Number(investment.amount || 0);

          const dailyReturn =
            Number(
              investment.stated_daily_return || 0
            );

          const periodDays =
            Number(
              investment.period_days || 0
            );

          // Total investment
          totalInvestment += amount;

          // ======================================
          // FULL 24-HOUR PERIODS
          // ======================================

          const startDate =
            new Date(investment.start_date);

          const elapsedMilliseconds =
            now.getTime() -
            startDate.getTime();

          const completeDays =
            Math.floor(
              elapsedMilliseconds /
                (1000 * 60 * 60 * 24)
            );

          const earnedDays =
            Math.max(
              0,
              Math.min(
                completeDays,
                periodDays
              )
            );

          // ======================================
          // INVESTMENT EARNINGS
          // ======================================

          investmentEarnings +=
            earnedDays * dailyReturn;
        });

        // ==========================================
        // REFERRAL EARNINGS
        // ==========================================

        const [referralResult] =
          await db.query(
            `
            SELECT
              COALESCE(
                SUM(commission_amount),
                0
              ) AS referral_earnings
            FROM referral_commissions
            WHERE user_id = ?
            `,
            [user.id]
          );

        const referralEarnings =
          Number(
            referralResult[0]?.referral_earnings || 0
          );

        // ==========================================
        // TOTAL EARNINGS
        // ==========================================

        const totalEarnings =
          investmentEarnings +
          referralEarnings;

        // ==========================================
        // WITHDRAWALS
        // ==========================================

        const [withdrawalResult] =
          await db.query(
            `
            SELECT
              COALESCE(
                SUM(amount),
                0
              ) AS total_withdrawals
            FROM withdrawals
            WHERE user_id = ?
            AND status IN (
              'pending',
              'approved'
            )
            `,
            [user.id]
          );

        const totalWithdrawals =
          Number(
            withdrawalResult[0]?.total_withdrawals || 0
          );

        // ==========================================
        // AVAILABLE BALANCE
        // ==========================================

        const availableBalance =
          Math.max(
            totalEarnings -
              totalWithdrawals,
            0
          );

        // ==========================================
        // PROFIT
        // TOTAL WITHDRAWALS - TOTAL INVESTMENT
        // ==========================================

        const profit =
          totalWithdrawals -
          totalInvestment;

        // ==========================================
        // ADD USER TO MONITORING DATA
        // ==========================================

        monitoringData.push({

          id: user.id,

          full_name:
            user.full_name || "N/A",

          // Database column is "phone"
          phone_number:
            user.phone || "N/A",

          email:
            user.email || "N/A",

          // User registration date
          created_at:
            user.created_at || null,

          total_investment:
            totalInvestment,

          investment_earnings:
            investmentEarnings,

          referral_earnings:
            referralEarnings,

          total_earnings:
            totalEarnings,

          total_withdrawals:
            totalWithdrawals,

          available_balance:
            availableBalance,

          profit:
            profit
        });
      }

      // ==========================================
      // SEND RESPONSE
      // ==========================================

      console.log(
        "Monitoring data:",
        monitoringData
      );

      res.json({
        users: monitoringData
      });

    } catch (error) {

      console.error(
        "USER MONITORING ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load user monitoring data."
      });
    }
  }
);
app.post(
  "/api/reject-withdrawal",
  async (req, res) => {

    try {

      const {
        withdrawal_id
      } = req.body;


      if (!withdrawal_id) {
        return res.status(400).json({
          message:
            "Withdrawal ID is required."
        });
      }


      const [result] =
        await db.query(
          `
          UPDATE withdrawals
          SET status = 'rejected'
          WHERE id = ?
          AND status = 'pending'
          `,
          [withdrawal_id]
        );


      if (
        result.affectedRows === 0
      ) {
        return res.status(400).json({
          message:
            "Withdrawal not found or already processed."
        });
      }


      res.json({
        message:
          "Withdrawal rejected successfully."
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to reject withdrawal."
      });
    }
  }
);


// ======================================================
// USER WITHDRAWAL HISTORY
// ======================================================

// ======================================================
// SUBMIT WITHDRAWAL REQUEST
// ======================================================

app.post(
  "/api/withdrawals",
  async (req, res) => {

    try {

      const {
        user_id,
        phone_number,
        amount
      } = req.body;


      // =================================================
      // BASIC VALIDATION
      // =================================================

      if (
        !user_id ||
        !phone_number ||
        !amount
      ) {

        return res.status(400).json({
          message:
            "Please provide your phone number and withdrawal amount."
        });

      }


      const withdrawalAmount =
        Number(amount);


      if (
        !Number.isFinite(withdrawalAmount) ||
        withdrawalAmount <= 0
      ) {

        return res.status(400).json({
          message:
            "Please enter a valid withdrawal amount."
        });

      }


      // =================================================
      // MINIMUM WITHDRAWAL
      // =================================================

      if (
        withdrawalAmount < 5000
      ) {

        return res.status(400).json({
          message:
            "Minimum withdrawal is UGX 5,000."
        });

      }


      // =================================================
      // CHECK USER EXISTS
      // =================================================

      const [userResult] =
        await db.query(
          `
          SELECT
            id
          FROM users
          WHERE id = ?
          `,
          [user_id]
        );


      if (
        userResult.length === 0
      ) {

        return res.status(404).json({
          message:
            "User not found."
        });

      }


      // =================================================
      // GET ACTIVE INVESTMENTS
      // =================================================

      const [investments] =
        await db.query(
          `
          SELECT
            i.start_date,
            i.status,
            p.stated_daily_return,
            p.period_days
          FROM investments i
          JOIN investment_plans p
            ON i.plan_id = p.id
          WHERE i.user_id = ?
          AND i.status = 'active'
          `,
          [user_id]
        );


      // =================================================
      // CALCULATE INVESTMENT EARNINGS
      // =================================================

      let investmentEarnings = 0;

      const now =
        new Date();


      investments.forEach(
        (investment) => {

          const dailyReturn =
            Number(
              investment.stated_daily_return
            );


          const periodDays =
            Number(
              investment.period_days
            );


          const startDate =
            new Date(
              investment.start_date
            );


          const elapsedMilliseconds =
            now.getTime() -
            startDate.getTime();


          const completeDays =
            Math.floor(
              elapsedMilliseconds /
              (
                1000 *
                60 *
                60 *
                24
              )
            );


          const earnedDays =
            Math.min(
              Math.max(
                completeDays,
                0
              ),
              periodDays
            );


          investmentEarnings +=
            earnedDays *
            dailyReturn;

        }
      );


      // =================================================
      // REFERRAL EARNINGS
      // =================================================

      const [referralResult] =
        await db.query(
          `
          SELECT
            COALESCE(
              SUM(commission_amount),
              0
            ) AS referral_earnings
          FROM referral_commissions
          WHERE user_id = ?
          `,
          [user_id]
        );


      const referralEarnings =
        Number(
          referralResult[0]
            .referral_earnings
        );


      // =================================================
      // WELCOME BONUS
      // =================================================
      //
      // Every user receives UGX 2,000.
      //
      // It is immediately part of the available
      // balance.
      // =================================================

      const welcomeBonus =
        2000;


      // =================================================
      // NORMAL EARNINGS
      // =================================================

      const normalEarnings =
        investmentEarnings +
        referralEarnings;


      // =================================================
      // PREVIOUS + PENDING WITHDRAWALS
      // =================================================
      //
      // Pending withdrawals are included here so a
      // user cannot submit several requests whose
      // combined amount exceeds their balance.
      //
      // Rejected withdrawals are NOT included.
      // =================================================

      const [withdrawals] =
        await db.query(
          `
          SELECT
            COALESCE(
              SUM(amount),
              0
            ) AS withdrawn_amount
          FROM withdrawals
          WHERE user_id = ?
          AND status IN
          ('pending', 'approved')
          `,
          [user_id]
        );


      const withdrawnAmount =
        Number(
          withdrawals[0]
            .withdrawn_amount
        );


      // =================================================
      // AVAILABLE BALANCE
      // =================================================

      const availableBalance =
        Math.max(
          (
            normalEarnings +
            welcomeBonus
          ) -
          withdrawnAmount,
          0
        );


      // =================================================
      // CHECK AVAILABLE BALANCE
      // =================================================

      if (
        withdrawalAmount >
        availableBalance
      ) {

        return res.status(400).json({
          message:
            "Insufficient available balance."
        });

      }


      // =================================================
      // WITHDRAWAL CHARGE
      // =================================================

      const charge =
        withdrawalAmount *
        0.10;


      const netAmount =
        withdrawalAmount -
        charge;


      // =================================================
      // SAVE WITHDRAWAL AS PENDING
      // =================================================
      //
      // Nothing is deducted from the user's account
      // at this stage.
      //
      // The amount becomes an actual withdrawal only
      // after admin approval.
      // =================================================

      await db.query(
        `
        INSERT INTO withdrawals
        (
          user_id,
          phone_number,
          amount,
          charge,
          net_amount,
          status
        )
        VALUES
        (?, ?, ?, ?, ?, 'pending')
        `,
        [
          user_id,
          phone_number,
          withdrawalAmount,
          charge,
          netAmount
        ]
      );


      // =================================================
      // SUCCESS RESPONSE
      // =================================================

      res.status(201).json({

        message:
          "Withdrawal request submitted successfully. Your withdrawal is pending approval.",

        amount:
          withdrawalAmount,

        charge:
          charge,

        net_amount:
          netAmount

      });


    } catch (error) {

      console.error(error);


      res.status(500).json({
        message:
          "Unable to submit withdrawal request."
      });

    }

  }
);
// ======================================================
// GET WITHDRAWAL HISTORY
// ======================================================

app.get(
  "/api/withdrawals/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      const [withdrawals] = await db.query(
        `
        SELECT
          id,
          user_id,
          phone_number,
          amount,
          charge,
          net_amount,
          status,
          created_at
        FROM withdrawals
        WHERE user_id = ?
        AND status IN ('pending', 'approved')
        ORDER BY created_at DESC
        `,
        [userId]
      );

      res.json({
        withdrawals
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Unable to load withdrawal history."
      });
    }
  }
);
app.post(
  "/api/pending-deposits",
  async (req, res) => {

    try {

      const {
        user_id,
        amount,
        phone_number,
        plan_id
      } = req.body;


      if (
        !user_id ||
        !amount ||
        !phone_number ||
        !plan_id
      ) {
        return res.status(400).json({
          message:
            "Please provide all deposit information.",
        });
      }


      await db.query(
        `
        INSERT INTO deposits
        (
          user_id,
          plan_id,
          amount,
          phone_number,
          status
        )
        VALUES
        (?, ?, ?, ?, 'pending')
        `,
        [
          user_id,
          plan_id,
          amount,
          phone_number
        ]
      );


      res.status(201).json({
        message:
          "Deposit submitted successfully.",
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to submit deposit.",
      });
    }
  }
);


// ======================================================
// APPROVED DEPOSITS - ADMIN
// ======================================================

app.get(
  "/api/approved-deposits",
  requireAdmin,
  async (req, res) => {

    try {

      const [deposits] =
        await db.query(
          `
          SELECT
            deposits.id,
            deposits.user_id,
            deposits.plan_id,
            deposits.amount,
            deposits.phone_number,
            deposits.status,
            deposits.created_at,
            users.full_name,
            investment_plans.name AS plan_name
          FROM deposits
          JOIN users
            ON deposits.user_id =
               users.id
          JOIN investment_plans
            ON deposits.plan_id =
               investment_plans.id
          WHERE deposits.status = 'approved'
          ORDER BY deposits.created_at DESC
          `
        );


      res.json({
        deposits
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load approved deposits.",
      });
    }
  }
);


// ======================================================
// APPROVE DEPOSIT
// ======================================================

app.post(
  "/api/approve-deposit",
  requireAdmin,
  async (req, res) => {

    try {

      const {
        deposit_id
      } = req.body;


      if (!deposit_id) {
        return res.status(400).json({
          message:
            "Deposit ID is required.",
        });
      }


      // ------------------------------------------------
      // Get deposit + referral information
      // ------------------------------------------------

      const [deposits] =
        await db.query(
          `
          SELECT
            deposits.*,
            investment_plans.investment_amount,
            investment_plans.period_days,
            users.referred_by
          FROM deposits
          JOIN investment_plans
            ON deposits.plan_id =
               investment_plans.id
          JOIN users
            ON deposits.user_id =
               users.id
          WHERE deposits.id = ?
          AND deposits.status = 'pending'
          `,
          [deposit_id]
        );


      if (deposits.length === 0) {
        return res.status(404).json({
          message:
            "Pending deposit not found.",
        });
      }


      const deposit =
        deposits[0];


      // ------------------------------------------------
      // Create investment
      // ------------------------------------------------

      const [investmentResult] =
        await db.query(
          `
          INSERT INTO investments
          (
            user_id,
            plan_id,
            amount,
            start_date,
            end_date,
            status
          )
          VALUES
          (
            ?,
            ?,
            ?,
            NOW(),
            DATE_ADD(
              NOW(),
              INTERVAL ? DAY
            ),
            'active'
          )
          `,
          [
            deposit.user_id,
            deposit.plan_id,
            deposit.amount,
            deposit.period_days,
          ]
        );


      const investmentId =
        investmentResult.insertId;


      // ------------------------------------------------
      // Mark deposit approved
      // ------------------------------------------------

      await db.query(
        `
        UPDATE deposits
        SET status = 'approved'
        WHERE id = ?
        `,
        [deposit.id]
      );


      // ------------------------------------------------
      // Investment transaction
      // ------------------------------------------------

      await db.query(
        `
        INSERT INTO transactions
        (
          user_id,
          investment_id,
          type,
          amount,
          description,
          status
        )
        VALUES
        (
          ?,
          ?,
          'investment',
          ?,
          ?,
          'completed'
        )
        `,
        [
          deposit.user_id,
          investmentId,
          deposit.amount,
          "Approved investment deposit",
        ]
      );


      // =================================================
      // REFERRAL COMMISSION
      // =================================================

      let currentUserId =
        deposit.user_id;


      const referralLevels = [
        {
          level: 1,
          rate: 20
        },
        {
          level: 2,
          rate: 3
        },
        {
          level: 3,
          rate: 1
        }
      ];


      for (
        const referral
        of referralLevels
      ) {

        const [referrers] =
          await db.query(
            `
            SELECT
              id,
              referred_by
            FROM users
            WHERE id = ?
            `,
            [currentUserId]
          );


        if (
          referrers.length === 0
        ) {
          break;
        }


        const referrerId =
          referrers[0]
            .referred_by;


        if (!referrerId) {
          break;
        }


        const commissionAmount =
          Number(deposit.amount) *
          (
            referral.rate / 100
          );


        // Prevent duplicate commission
        const [
          existingCommission
        ] = await db.query(
          `
          SELECT id
          FROM referral_commissions
          WHERE investment_id = ?
          AND level = ?
          `,
          [
            investmentId,
            referral.level
          ]
        );


        if (
          existingCommission.length === 0
        ) {

          await db.query(
            `
            INSERT INTO referral_commissions
            (
              user_id,
              referred_user_id,
              investment_id,
              level,
              commission_rate,
              commission_amount
            )
            VALUES
            (?, ?, ?, ?, ?, ?)
            `,
            [
              referrerId,
              deposit.user_id,
              investmentId,
              referral.level,
              referral.rate,
              commissionAmount,
            ]
          );
        }


        currentUserId =
          referrerId;
      }


      res.json({
        message:
          "Deposit approved successfully.",

        investment_id:
          investmentId,
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to approve deposit.",
      });
    }
  }
);


// ======================================================
// DASHBOARD
// ======================================================

app.get("/api/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // =================================================
    // GET USER + WELCOME BONUS INFORMATION
    // =================================================

    const [userResult] = await db.query(
      `
      SELECT
        id,
        welcome_bonus,
        welcome_bonus_unlocked,
        welcome_bonus_used,
        welcome_bonus_remaining
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const user = userResult[0];

    const welcomeBonus =
      Number(user.welcome_bonus || 0);

    const welcomeBonusUnlocked =
      Boolean(user.welcome_bonus_unlocked);

    const welcomeBonusUsed =
      Boolean(user.welcome_bonus_used);

    const welcomeBonusRemaining =
      Number(user.welcome_bonus_remaining || 0);


    // =================================================
    // GET ACTIVE INVESTMENTS
    // =================================================

    const [investments] = await db.query(
      `
      SELECT
        i.amount,
        i.start_date,
        i.status,
        p.stated_daily_return,
        p.period_days
      FROM investments i
      JOIN investment_plans p
        ON i.plan_id = p.id
      WHERE i.user_id = ?
      AND i.status = 'active'
      `,
      [userId]
    );


    // =================================================
    // CALCULATE INVESTMENT EARNINGS
    // =================================================

    let totalInvestment = 0;
    let activeInvestments = 0;
    let investmentEarnings = 0;
    let todaysReturn = 0;
    let claimableReturn = 0; // NEW: Track claimable amount

    const now = new Date();

    investments.forEach((investment) => {

      const amount =
        Number(investment.amount || 0);

      const dailyReturn =
        Number(
          investment.stated_daily_return || 0
        );

      const periodDays =
        Number(
          investment.period_days || 0
        );

      const startDate =
        new Date(investment.start_date);


      totalInvestment += amount;

      activeInvestments++;


      // -----------------------------------------------
      // FULL 24-HOUR PERIODS ELAPSED
      // -----------------------------------------------

      const elapsedMilliseconds =
        now.getTime() -
        startDate.getTime();

      const completeDays =
        Math.floor(
          elapsedMilliseconds /
          (
            1000 *
            60 *
            60 *
            24
          )
        );


      // -----------------------------------------------
      // DAYS THAT CAN GENERATE EARNINGS
      // -----------------------------------------------

      const earnedDays =
        Math.min(
          Math.max(
            completeDays,
            0
          ),
          periodDays
        );


      // -----------------------------------------------
      // TOTAL INVESTMENT EARNINGS
      // -----------------------------------------------

      investmentEarnings +=
        earnedDays *
        dailyReturn;


      // -----------------------------------------------
      // TODAY'S RETURN - SHOWS IMMEDIATELY (CHANGED)
      // -----------------------------------------------
      // Now displays the daily return amount right away
      // as soon as the investment is active.

      if (earnedDays < periodDays) {
        todaysReturn += dailyReturn;
      }

      // -----------------------------------------------
      // CLAIMABLE RETURN - After 24 hours (NEW)
      // -----------------------------------------------
      // Track what's actually available to withdraw

      if (completeDays >= 1 && earnedDays < periodDays) {
        claimableReturn += dailyReturn;
      }

    });


    // =================================================
    // REFERRAL EARNINGS
    // =================================================

    const [referralResult] =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(commission_amount),
            0
          ) AS referral_earnings
        FROM referral_commissions
        WHERE user_id = ?
        `,
        [userId]
      );


    const referralEarnings =
      Number(
        referralResult[0]
          .referral_earnings || 0
      );


    // =================================================
    // TOTAL NORMAL EARNINGS
    // =================================================

    const totalEarnings =
      investmentEarnings +
      referralEarnings;


    // =================================================
    // PREVIOUS + PENDING WITHDRAWALS
    // =================================================

    const [withdrawalResult] =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS withdrawn_amount
        FROM withdrawals
        WHERE user_id = ?
        AND status IN
        ('pending', 'approved')
        `,
        [userId]
      );


    const withdrawnAmount =
      Number(
        withdrawalResult[0]
          .withdrawn_amount || 0
      );


    // =================================================
    // AVAILABLE WELCOME BONUS
    // =================================================

    let bonusAvailable = 0;

    if (
      welcomeBonusUnlocked &&
      !welcomeBonusUsed &&
      welcomeBonusRemaining > 0
    ) {
      bonusAvailable =
        welcomeBonusRemaining;
    }


    // =================================================
    // AVAILABLE BALANCE
    // =================================================

    const availableBalance =
      Math.max(
        (
          totalEarnings +
          bonusAvailable
        ) -
        withdrawnAmount,
        0
      );


    // =================================================
    // RESPONSE (UPDATED with claimable_return)
    // =================================================

    res.json({

      total_investment:
        totalInvestment,

      active_investments:
        activeInvestments,

      investment_earnings:
        investmentEarnings,

      referral_earnings:
        referralEarnings,

      total_earnings:
        totalEarnings,

      todays_return:
        todaysReturn, // Now shows immediately

      claimable_return:
        claimableReturn, // NEW: What's ready to withdraw

      available_balance:
        availableBalance,

      welcome_bonus:
        welcomeBonus,

      welcome_bonus_unlocked:
        welcomeBonusUnlocked,

      welcome_bonus_used:
        welcomeBonusUsed,

      welcome_bonus_remaining:
        welcomeBonusRemaining

    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load dashboard."
    });

  }
});
// ======================================================
// REFERRALS
// ======================================================

app.get(
  "/api/referrals/:userId",
  async (req, res) => {

    try {

      const {
        userId
      } = req.params;


      const [users] =
        await db.query(
          `
          SELECT
            id,
            full_name,
            referral_code
          FROM users
          WHERE id = ?
          `,
          [userId]
        );


      if (users.length === 0) {
        return res.status(404).json({
          message:
            "User not found."
        });
      }


      const user =
        users[0];


      // ------------------------------------------------
      // Level 1
      // ------------------------------------------------

      const [level1] =
        await db.query(
          `
          SELECT
            id,
            full_name,
            email,
            phone
          FROM users
          WHERE referred_by = ?
          `,
          [userId]
        );


      // ------------------------------------------------
      // Level 2
      // ------------------------------------------------

      let level2 = [];


      if (
        level1.length > 0
      ) {

        const level1Ids =
          level1.map(
            referral =>
              referral.id
          );


        const placeholders =
          level1Ids
            .map(() => "?")
            .join(",");


        const [level2Results] =
          await db.query(
            `
            SELECT
              id,
              full_name,
              email,
              phone,
              referred_by
            FROM users
            WHERE referred_by IN
            (${placeholders})
            `,
            level1Ids
          );


        level2 =
          level2Results;
      }


      // ------------------------------------------------
      // Level 3
      // ------------------------------------------------

      let level3 = [];


      if (
        level2.length > 0
      ) {

        const level2Ids =
          level2.map(
            referral =>
              referral.id
          );


        const placeholders =
          level2Ids
            .map(() => "?")
            .join(",");


        const [level3Results] =
          await db.query(
            `
            SELECT
              id,
              full_name,
              email,
              phone,
              referred_by
            FROM users
            WHERE referred_by IN
            (${placeholders})
            `,
            level2Ids
          );


        level3 =
          level3Results;
      }


      // ------------------------------------------------
      // Combine levels
      // ------------------------------------------------

      const allReferralUsers = [

        ...level1.map(
          referral => ({
            ...referral,
            level: 1
          })
        ),

        ...level2.map(
          referral => ({
            ...referral,
            level: 2
          })
        ),

        ...level3.map(
          referral => ({
            ...referral,
            level: 3
          })
        )

      ];


      // ------------------------------------------------
      // Get investment for each referral
      // ------------------------------------------------

      for (
        const referral
        of allReferralUsers
      ) {

        const [investments] =
          await db.query(
            `
            SELECT
              i.id,
              i.amount,
              i.status,
              p.name AS plan_name
            FROM investments i
            JOIN investment_plans p
              ON i.plan_id = p.id
            WHERE i.user_id = ?
            AND i.status = 'active'
            ORDER BY i.id DESC
            LIMIT 1
            `,
            [referral.id]
          );


        if (
          investments.length > 0
        ) {

          referral.investment_status =
            "active";

          referral.plan_name =
            investments[0]
              .plan_name;

          referral.investment_amount =
            Number(
              investments[0]
                .amount
            );

        } else {

          referral.investment_status =
            "none";

          referral.plan_name =
            null;

          referral.investment_amount =
            0;
        }
      }


      // ------------------------------------------------
      // Referral earnings
      // ------------------------------------------------

      const [earningsResult] =
        await db.query(
          `
          SELECT
            COALESCE(
              SUM(commission_amount),
              0
            ) AS total_referral_earnings
          FROM referral_commissions
          WHERE user_id = ?
          `,
          [userId]
        );


      const totalReferralEarnings =
        Number(
          earningsResult[0]
            .total_referral_earnings
        );


      const totalReferrals =
        allReferralUsers.length;


      const activeReferrals =
        allReferralUsers.filter(
          referral =>
            referral.investment_status ===
            "active"
        ).length;


      const totalTeamInvestment =
        allReferralUsers.reduce(
          (
            total,
            referral
          ) =>
            total +
            Number(
              referral.investment_amount ||
              0
            ),
          0
        );


      res.json({

        referral_code:
          user.referral_code,

        total_referrals:
          totalReferrals,

        active_referrals:
          activeReferrals,

        total_team_investment:
          totalTeamInvestment,

        total_referral_earnings:
          totalReferralEarnings,

        level1_count:
          level1.length,

        level2_count:
          level2.length,

        level3_count:
          level3.length,

        referrals:
          allReferralUsers
      });


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load referral information."
      });
    }
  }
);


// ======================================================
// TRANSACTIONS
// ======================================================

app.get(
  "/api/my-transactions/:userId",
  async (req, res) => {

    try {

      const {
        userId
      } = req.params;


      const [transactions] =
        await db.query(
          `
          SELECT
            id,
            type,
            amount,
            description,
            status,
            created_at
          FROM transactions
          WHERE user_id = ?
          ORDER BY created_at DESC
          `,
          [userId]
        );


      res.json(transactions);


    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Unable to load transactions.",
      });
    }
  }
);


// ======================================================
// PROFILE
// ======================================================

app.get("/api/profile/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("=================================");
    console.log("PROFILE ROUTE CALLED");
    console.log("USER ID:", userId);
    console.log("=================================");

    // ==========================================
    // USER INFORMATION
    // ==========================================

    const [users] = await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        created_at,
        referral_code
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const user = users[0];

    // ==========================================
    // INVESTMENTS
    // ==========================================

    const [investments] = await db.query(
      `
      SELECT
        i.amount,
        i.start_date,
        p.stated_daily_return,
        p.period_days
      FROM investments i
      JOIN investment_plans p
        ON i.plan_id = p.id
      WHERE i.user_id = ?
      `,
      [userId]
    );

    console.log(
      "INVESTMENTS FOUND:",
      investments.length
    );

    let totalInvestment = 0;
    let investmentEarnings = 0;

    const now = new Date();

    investments.forEach((investment) => {
      const amount = Number(
        investment.amount || 0
      );

      const dailyReturn = Number(
        investment.stated_daily_return || 0
      );

      const periodDays = Number(
        investment.period_days || 0
      );

      totalInvestment += amount;

      const startDate = new Date(
        investment.start_date
      );

      const elapsedMilliseconds =
        now.getTime() -
        startDate.getTime();

      const completeDays = Math.floor(
        elapsedMilliseconds /
          (1000 * 60 * 60 * 24)
      );

      const earnedDays = Math.max(
        0,
        Math.min(
          completeDays,
          periodDays
        )
      );

      investmentEarnings +=
        earnedDays * dailyReturn;
    });

    // ==========================================
    // REFERRAL EARNINGS
    // ==========================================

    const [referralResult] =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(commission_amount),
            0
          ) AS referral_earnings
        FROM referral_commissions
        WHERE user_id = ?
        `,
        [userId]
      );

    const referralEarnings = Number(
      referralResult[0]?.referral_earnings || 0
    );

    // ==========================================
    // TOTAL EARNINGS
    // ==========================================

    const totalEarnings =
      investmentEarnings +
      referralEarnings;

    // ==========================================
    // WITHDRAWALS
    // ==========================================

    const [withdrawalResult] =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS total_withdrawals
        FROM withdrawals
        WHERE user_id = ?
        AND status IN ('pending', 'approved')
        `,
        [userId]
      );

    const totalWithdrawals = Number(
      withdrawalResult[0]?.total_withdrawals || 0
    );

    // ==========================================
    // AVAILABLE BALANCE
    // ==========================================

    const availableBalance = Math.max(
      totalEarnings -
        totalWithdrawals,
      0
    );

    // ==========================================
    // FINAL PROFILE DATA
    // ==========================================

    const profileData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      referral_code: user.referral_code,

      total_investment: totalInvestment,
      investment_earnings: investmentEarnings,
      referral_earnings: referralEarnings,
      total_earnings: totalEarnings,
      total_withdrawals: totalWithdrawals,
      available_balance: availableBalance
    };

    console.log(
      "PROFILE DATA BEING SENT:"
    );

    console.log(profileData);

    res.json(profileData);

  } catch (error) {
    console.error(
      "PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load profile."
    });
  }
});

// ======================================================
// SUBMIT WITHDRAWAL
// ======================================================

app.post("/api/withdrawals", async (req, res) => {
  try {
    const {
      user_id,
      phone_number,
      amount
    } = req.body;

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (!user_id || !phone_number || !amount) {
      return res.status(400).json({
        message:
          "Please provide your phone number and withdrawal amount."
      });
    }

    const withdrawalAmount = Number(amount);

    // =================================================
    // CHECK AMOUNT
    // =================================================

    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount <= 0
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid withdrawal amount."
      });
    }

    // =================================================
    // MINIMUM WITHDRAWAL
    // =================================================

    if (withdrawalAmount < 5000) {
      return res.status(400).json({
        message:
          "Minimum withdrawal is UGX 5,000."
      });
    }

    // =================================================
    // GET USER BONUS
    // =================================================

    const [userResult] = await db.query(
      `
      SELECT
        welcome_bonus_remaining
      FROM users
      WHERE id = ?
      `,
      [user_id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        message:
          "User not found."
      });
    }

    const welcomeBonusRemaining = Number(
      userResult[0].welcome_bonus_remaining || 0
    );

    // =================================================
    // GET ACTIVE INVESTMENTS
    // =================================================

    const [investments] = await db.query(
      `
      SELECT
        i.start_date,
        p.stated_daily_return,
        p.period_days
      FROM investments i
      JOIN investment_plans p
        ON i.plan_id = p.id
      WHERE i.user_id = ?
      AND i.status = 'active'
      `,
      [user_id]
    );

    // =================================================
    // CALCULATE INVESTMENT EARNINGS
    // =================================================

    let investmentEarnings = 0;

    const now = new Date();

    investments.forEach((investment) => {
      const dailyReturn = Number(
        investment.stated_daily_return || 0
      );

      const periodDays = Number(
        investment.period_days || 0
      );

      const startDate = new Date(
        investment.start_date
      );

      const elapsedMilliseconds =
        now.getTime() -
        startDate.getTime();

      const completeDays = Math.floor(
        elapsedMilliseconds /
          (1000 * 60 * 60 * 24)
      );

      const earnedDays = Math.min(
        Math.max(completeDays, 0),
        periodDays
      );

      investmentEarnings +=
        earnedDays * dailyReturn;
    });

    // =================================================
    // REFERRAL EARNINGS
    // =================================================

    const [referralResult] =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(commission_amount),
            0
          ) AS referral_earnings
        FROM referral_commissions
        WHERE user_id = ?
        `,
        [user_id]
      );

    const referralEarnings = Number(
      referralResult[0]
        .referral_earnings || 0
    );

    // =================================================
    // TOTAL NORMAL EARNINGS
    // =================================================

    const normalEarnings =
      investmentEarnings +
      referralEarnings;

    // =================================================
    // GET PREVIOUS + RESERVED WITHDRAWALS
    // =================================================
    //
    // BOTH pending and approved withdrawals
    // are unavailable to the user.
    //
    // Rejected withdrawals are NOT included,
    // therefore their money becomes available again.
    // =================================================

    const [withdrawalResult] =
      await db.query(
        `
        SELECT
          COALESCE(
            SUM(amount),
            0
          ) AS withdrawn_amount
        FROM withdrawals
        WHERE user_id = ?
        AND status IN ('pending', 'approved')
        `,
        [user_id]
      );

    const withdrawnAmount = Number(
      withdrawalResult[0]
        .withdrawn_amount || 0
    );

    // =================================================
    // CALCULATE AVAILABLE BALANCE
    // =================================================

    const availableBalance = Math.max(
      (
        normalEarnings +
        welcomeBonusRemaining
      ) -
      withdrawnAmount,
      0
    );

    // =================================================
    // CHECK AVAILABLE BALANCE
    // =================================================

    if (
      withdrawalAmount >
      availableBalance
    ) {
      return res.status(400).json({
        message:
          `Insufficient available balance. Your available balance is UGX ${availableBalance.toLocaleString()}.`
      });
    }

    // =================================================
    // WITHDRAWAL CHARGE
    // =================================================

    const charge =
      withdrawalAmount * 0.10;

    const netAmount =
      withdrawalAmount - charge;

    // =================================================
    // SAVE WITHDRAWAL AS PENDING
    // =================================================
    //
    // IMPORTANT:
    //
    // We DO NOT modify the welcome bonus here.
    //
    // The withdrawal amount itself becomes reserved
    // because the new withdrawal is saved as 'pending'.
    //
    // The dashboard will subtract pending withdrawals.
    // =================================================

    const [result] =
      await db.query(
        `
        INSERT INTO withdrawals
        (
          user_id,
          phone_number,
          amount,
          charge,
          net_amount,
          status
        )
        VALUES
        (?, ?, ?, ?, ?, 'pending')
        `,
        [
          user_id,
          phone_number,
          withdrawalAmount,
          charge,
          netAmount
        ]
      );

    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({
      message:
        "Withdrawal request submitted successfully. Your withdrawal is pending approval.",

      withdrawal_id:
        result.insertId,

      amount:
        withdrawalAmount,

      charge:
        charge,

      net_amount:
        netAmount,

      available_balance:
        Math.max(
          availableBalance -
          withdrawalAmount,
          0
        )
    });

  } catch (error) {

    console.error(
      "Withdrawal error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to submit withdrawal request."
    });
  }
});

// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      "Server running on http://localhost:" +
      PORT
    );

  }
);