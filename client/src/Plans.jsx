import { useEffect, useState } from "react";

function Plans() {
  const [plans, setPlans] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Custom purchase confirmation popup
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] =
    useState(null);

  // ===============================
  // OPEN PURCHASE CONFIRMATION
  // ===============================
  const handleViewPlan = (plan) => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      alert("Please login first.");
      return;
    }

    localStorage.setItem(
      "selectedPlan",
      JSON.stringify(plan)
    );

    setSelectedPlanForPurchase(plan);
  };

  // ===============================
  // CONTINUE TO DEPOSIT
  // ===============================
  const continueToDeposit = () => {
    if (!selectedPlanForPurchase) {
      return;
    }

    window.location.href = "/deposit";
  };

  // ===============================
  // CANCEL PURCHASE
  // ===============================
  const cancelPurchase = () => {
    setSelectedPlanForPurchase(null);
  };

  // ===============================
  // LOAD PLANS AND INVESTMENTS
  // ===============================
  useEffect(() => {
    fetch(
      "http://localhost:5000/api/investment-plans"
    )
      .then((response) => response.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setMessage(
          "Unable to load investment plans."
        );
        setLoading(false);
      });

    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {
      const loggedInUser =
        JSON.parse(savedUser);

      fetch(
        "http://localhost:5000/api/my-investments/" +
          loggedInUser.id
      )
        .then((response) => response.json())
        .then((data) => {
          setMyInvestments(data);
        })
        .catch((error) => {
          console.error(
            "My investments error:",
            error
          );
        });
    }
  }, []);

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <h2>
        Loading investment plans...
      </h2>
    );
  }

  return (
    <div className="plans-page">

      {/* ===============================
          BRAND
      =============================== */}

      <div className="brand-spacing">
        <h1 className="brand-title">
          ANDRE ROYAL INVEST
        </h1>
      </div>

      {/* ===============================
          INVESTMENT PLANS
      =============================== */}

      <h2 className="plans-heading">
        Investment Plans
      </h2>

      {message && <p>{message}</p>}

      <div className="plans-container">

        {plans.map((plan) => (
          <div
            className="plan-card"
            key={plan.id}
          >

            <h2>{plan.name}</h2>

            <p>
              Investment:{" "}
              <strong>
                UGX{" "}
                {Number(
                  plan.investment_amount
                ).toLocaleString()}
              </strong>
            </p>

            <p>
              Stated daily return:{" "}
              <strong>
                UGX{" "}
                {Number(
                  plan.stated_daily_return
                ).toLocaleString()}
              </strong>
            </p>

            <p>
              Period:{" "}
              <strong>
                {plan.period_days} days
              </strong>
            </p>

            <button
              onClick={() =>
                handleViewPlan(plan)
              }
            >
              Purchase Plan
            </button>

          </div>
        ))}

      </div>

      {/* ===============================
          MY ACTIVE INVESTMENTS
      =============================== */}
<div className="active-investments-card">

  <h2 className="active-investments-title">
    My Active Investments
  </h2>

        {myInvestments.length === 0 ? (
          <p>
            You have no investments yet.
          </p>
        ) : (
          myInvestments.map(
            (investment) => {

              const now = new Date();

              const startDate =
                new Date(
                  investment.start_date
                );

              const endDate =
                new Date(
                  investment.end_date
                );

              // Full 24-hour periods elapsed
              const elapsedMilliseconds =
                now.getTime() -
                startDate.getTime();

              const completeDays =
                Math.floor(
                  elapsedMilliseconds /
                    (1000 *
                      60 *
                      60 *
                      24)
                );

              const daysElapsed =
                Math.max(
                  0,
                  Math.min(
                    investment.period_days,
                    completeDays
                  )
                );

              const daysRemaining =
                Math.max(
                  0,
                  investment.period_days -
                    daysElapsed
                );

              const progressPercentage =
                investment.period_days > 0
                  ? Math.min(
                      100,
                      (
                        daysElapsed /
                        investment.period_days
                      ) *
                        100
                    )
                  : 0;

              const totalProgressReturn =
                Number(
                  investment.stated_daily_return
                ) *
                daysElapsed;

              const isActive =
                endDate >= now &&
                daysElapsed <
                  investment.period_days;

              return (
                <div
                  key={investment.id}
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
                    Daily Return: UGX{" "}
                    {Number(
                      investment.stated_daily_return
                    ).toLocaleString()}
                  </p>

                  {/* TOTAL PROGRESS RETURN */}

                  <p>
                    Total Progress Return: UGX{" "}
                    {totalProgressReturn.toLocaleString()}
                  </p>

                                   {/* PERIOD */}

                  <p>
                    Period:{" "}
                    {investment.period_days} days
                  </p>

 
                  {/* START DATE */}

                  <p>
                    Start Date:{" "}
                    {investment.start_date
                      ? new Date(
                          investment.start_date
                        ).toLocaleString()
                      : "Not available"}
                  </p>

                  {/* END DATE */}

                  <p>
                    End Date:{" "}
                    {investment.end_date
                      ? new Date(
                          investment.end_date
                        ).toLocaleString()
                      : "Not available"}
                  </p>


                  {/* STATUS */}

                  <p>
                    Status:{" "}

                    <span
                      style={{
                        display:
                          "inline-block",
                        padding:
                          "6px 18px",
                        borderRadius:
                          "20px",
                        backgroundColor:
                          isActive
                            ? "#13c230"
                            : "#6c757d",
                        color: "white",
                        fontWeight:
                          "normal",
                      }}
                    >
                      {isActive
                        ? "Active"
                        : "Completed"}
                    </span>
                  </p>
                  {/* PROGRESS */}

  <div className="investment-progress">

  <div className="progress-header">
    <span>Investment Progress</span>

    <strong>
      {progressPercentage.toFixed(1)}%
    </strong>
  </div>

  <div className="progress-track">
    <div
      className="progress-fill"
      style={{
        width: progressPercentage + "%",
      }}
    ></div>
  </div>

  <div className="progress-footer">
    <span>
      {daysElapsed} of {investment.period_days} days
    </span>

    <span>
      {daysRemaining} days remaining
    </span>
  </div>

</div>



                </div>
              );
            }
          )
        )}

      </div>

      {/* ===============================
          BACK TO DASHBOARD
      =============================== */}
<button
  className="back-dashboard-btn"
  onClick={() => {
    window.location.href = "/dashboard";
  }}
>
  ← Back to Dashboard
</button>

      {/* ==================================================
          CUSTOM PURCHASE CONFIRMATION MODAL
      ================================================== */}

      {selectedPlanForPurchase && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor:
              "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              width: "90%",
              maxWidth: "450px",
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "25px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >

            <h2>
              Confirm Investment
            </h2>

            <p>
              You are about to purchase:
            </p>

            <h3>
              {selectedPlanForPurchase.name}
            </h3>

            <p>
              <strong>
                Required Deposit
              </strong>
              <br />

              UGX{" "}
              {Number(
                selectedPlanForPurchase.investment_amount
              ).toLocaleString()}
            </p>

            <p>
              <strong>
                Daily Return
              </strong>
              <br />

              UGX{" "}
              {Number(
                selectedPlanForPurchase.stated_daily_return
              ).toLocaleString()}
            </p>

            <p>
              <strong>
                Investment Period
              </strong>
              <br />

              {
                selectedPlanForPurchase.period_days
              }{" "}
              days
            </p>

            <p
              style={{
                marginTop: "20px",
              }}
            >
              Would you like to continue
              to the deposit page?
            </p>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent:
                  "center",
                marginTop: "20px",
              }}
            >

              <button
                onClick={cancelPurchase}
                style={{
                  padding:
                    "10px 20px",
                  border: "none",
                  borderRadius:
                    "5px",
                  cursor:
                    "pointer",
                  backgroundColor:
                    "#6c757d",
                  color: "white",
                }}
              >
                CANCEL
              </button>

              <button
                onClick={
                  continueToDeposit
                }
                style={{
                  padding:
                    "10px 20px",
                  border: "none",
                  borderRadius:
                    "5px",
                  cursor:
                    "pointer",
                  backgroundColor:
                    "#198754",
                  color: "white",
                }}
              >
                CONTINUE
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Plans;