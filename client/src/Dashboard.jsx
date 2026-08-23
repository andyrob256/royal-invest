import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    total_investment: 0,
    active_investments: 0,
    total_earnings: 0,
    todays_return: 0,
    available_balance: 0,
    welcome_bonus: 0,
    welcome_bonus_unlocked: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);
    setUser(loggedInUser);

    fetch(
      "http://localhost:5000/api/my-investments/" +
        loggedInUser.id
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Investment data:", data);
        setInvestments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Investment error:", error);
        setLoading(false);
      });

    fetch(
      "http://localhost:5000/api/dashboard/" +
        loggedInUser.id
    )
      .then((response) => response.json())
      .then((data) => {
        setSummary(data);
      })
      .catch((error) => {
        console.error(
          "Dashboard summary error:",
          error
        );
      });

    fetch(
      "http://localhost:5000/api/my-transactions/" +
        loggedInUser.id
    )
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
      })
      .catch((error) => {
        console.error(
          "Transaction error:",
          error
        );
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <div className="dashboard-page">

      {/* NAVIGATION */}

  <nav className="dashboard-nav">
  <button 
    className={window.location.pathname === "/dashboard" ? "active" : ""}
    onClick={() => window.location.href = "/dashboard"}
  >
    Dashboard
  </button>

  <button 
    className={window.location.pathname === "/plans" ? "active" : ""}
    onClick={() => window.location.href = "/plans"}
  >
    Investment Plans
  </button>

  <button 
    className={window.location.pathname === "/profile" ? "active" : ""}
    onClick={() => window.location.href = "/profile"}
  >
    My Account
  </button>

  <button 
    className={window.location.pathname === "/deposit" ? "active" : ""}
    onClick={() => window.location.href = "/deposit"}
  >
    Deposit
  </button>

  <button 
    className={window.location.pathname === "/referral" ? "active" : ""}
    onClick={() => window.location.href = "/referral"}
  >
    Referrals
  </button>

  <button 
    className={window.location.pathname === "/withdraw" ? "active" : ""}
    onClick={() => window.location.href = "/withdraw"}
  >
    Withdraw
  </button>

  <button 
    className={window.location.pathname === "/about" ? "active" : ""}
    onClick={() => window.location.href = "/about"}
  >
    About Us
  </button>

  <button onClick={logout}>
    Logout
  </button>
</nav>

      {/* DASHBOARD TITLE */}

      <div className="dashboard-header">

        {/* WELCOME BONUS */}

        <div className="bonus-box">

          <p>WELCOME BONUS</p>

          <h2>
            UGX{" "}
            {Number(
              summary.welcome_bonus_remaining || 0
            ).toLocaleString()}
          </h2>

          {summary.welcome_bonus_unlocked &&
           !summary.welcome_bonus_used &&
           Number(summary.welcome_bonus_remaining || 0) > 0 ? (
            <small>✅ Unlocked</small>
          ) : (
            <small>🔒 Locked</small>
          )}

        </div>

        {/* CENTER WELCOME */}

        <div className="dashboard-welcome">

          <h1>Andre Royal Invest</h1>

          {user && (
            <h2>
              Welcome, {user.full_name} 👋
            </h2>
          )}

        </div>

        {/* AVAILABLE BALANCE */}

        <div className="balance-box">

          <p>AVAILABLE BALANCE</p>

          <h2>
            UGX{" "}
            {Number(
              summary.available_balance || 0
            ).toLocaleString()}
          </h2>

        </div>

      </div>

      {/* TOTAL INVESTMENT */}

      <div className="dashboard-card">

        <p>Total Investment</p>

        <h2>
          UGX{" "}
          {summary.total_investment.toLocaleString()}
        </h2>

      </div>

      {/* ACTIVE INVESTMENTS */}

      <div className="dashboard-card">

        <p>Active Investments</p>

        <h2>
          {summary.active_investments}
        </h2>

      </div>

      {/* TOTAL EARNINGS - UNCHANGED */}

      <div className="dashboard-card">

        <p>Total Earnings</p>

        <h2>
          UGX{" "}
          {summary.total_earnings.toLocaleString()}
        </h2>

      </div>

      {/* TODAY'S RETURN - ONLY THIS CHANGED */}

      <div className="dashboard-card">

        <p>
          Today's Return (after 24 hrs)
        </p>

        <h2>
          UGX{" "}
          {summary.todays_return.toLocaleString()}
        </h2>

      </div>

      {/* WHATSAPP COMMUNITY */}

      <div className="whatsapp-card">

        <div className="whatsapp-content">

          <h2>JOIN OUR COMMUNITY</h2>

          <p>
            Stay updated with important
            announcements, notifications 🔔
            and platform updates.
          </p>
           Join Our 
            WhatsApp community using the link below.
          <p>
            
          </p>
          <button
            onClick={() => {
              window.open(
                "https://chat.whatsapp.com/FYx31f7SmCpAOThnSnCbnz?s=cl&p=a&ilr=1",
                "_blank"
              );
            }}
          >
            💬 WhatsApp Group Link (click here to join)
          </button>

        </div>

      </div>

      {/* MY INVESTMENTS */}

      <div className="dashboard-card">

        <p className="section-title">
          MY INVESTMENTS
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : investments.length === 0 ? (
          <p>No investments yet.</p>
        ) : (
          investments.map((investment) => (

           <div
  key={investment.id}
  className="investment-item"
>

              <hr />

              <h3>
                {investment.name}
              </h3>

              <p>
                Amount: UGX{" "}
                {Number(
                  investment.amount
                ).toLocaleString()}
              </p>

              <p>
                Stated daily return: UGX{" "}
                {Number(
                  investment.stated_daily_return
                ).toLocaleString()}
              </p>

              <p>
                Period:{" "}
                {investment.period_days} days
              </p>

              <p className="investment-status">
                Status:{" "}
                <span
                  className={
                    investment.status === "active"
                      ? "status-active"
                      : ""
                  }
                >
                  {investment.status}
                </span>
              </p>

            </div>

          ))
        )}

      </div>

      {/* TRANSACTION HISTORY */}

      <div className="dashboard-card">

        <h2 className="section-title">
          TRANSACTION HISTORY
        </h2>

        {transactions.length === 0 ? (

          <p>No transactions yet.</p>

        ) : (

          transactions.map((transaction) => (

            <div
              key={transaction.id}
              className="transaction-item"
            >

              <hr />

              <p>
                <strong>
                  {transaction.type}
                </strong>
              </p>

              <p>
                Amount: UGX{" "}
                {Number(
                  transaction.amount
                ).toLocaleString()}
              </p>

              <p>
                {transaction.description}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}

                {transaction.status === "completed" ? (

                  <span className="status-completed">
                    [✓ COMPLETED]
                  </span>

                ) : (

                  transaction.status

                )}

              </p>

              <p>
                Date:{" "}
                {new Date(
                  transaction.created_at
                ).toLocaleString()}
              </p>

            </div>

          ))

        )}

      </div>

      {/* LOGOUT */}

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}

export default Dashboard;