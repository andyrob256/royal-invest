import { useEffect, useState } from "react";

function Deposit() {
  const [plan, setPlan] = useState(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const savedPlan = localStorage.getItem("selectedPlan");

    if (!savedPlan) {
      showAlert(
        "Something went wrong",
        "No investment plan has been selected."
      );
      return;
    }

    try {
      const selectedPlan = JSON.parse(savedPlan);

      setPlan(selectedPlan);

      // Automatically set required deposit amount
      setAmount(
        Number(selectedPlan.investment_amount).toString()
      );
    } catch (error) {
      console.error(error);

      showAlert(
        "Something went wrong",
        "Unable to load the selected investment plan."
      );
    }
  }, []);

  const showAlert = (title, text) => {
    setPopupTitle(title);
    setPopupMessage(text);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!reference) {
      showAlert(
        "Something went wrong",
        "Please enter the phone number used to make the deposit."
      );
      return;
    }

    try {
      const savedUser = localStorage.getItem("user");
      const savedPlan = localStorage.getItem("selectedPlan");

      if (!savedUser || !savedPlan) {
        showAlert(
          "Something went wrong",
          "User or investment plan information is missing."
        );
        return;
      }

      const user = JSON.parse(savedUser);
      const selectedPlan = JSON.parse(savedPlan);

      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/pending-deposits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            amount: selectedPlan.investment_amount,
            phone_number: reference,
            plan_id: selectedPlan.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setReference("");

        showAlert(
          "Deposit Submitted",
          "Your deposit request has been submitted successfully."
        );
      } else {
        showAlert(
          "Something went wrong",
          data.message || "Unable to submit deposit."
        );
      }
    } catch (error) {
      console.error(error);

      showAlert(
        "Connection Error",
        "Unable to connect to the server. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="deposit-page">

      <div className="deposit-card">

        {/* PAGE TITLE */}
        <div className="deposit-header">
          <h1>DEPOSIT</h1>
          <p>
            Complete your deposit to activate your
            selected investment plan.
          </p>
        </div>


        {/* SELECTED PLAN */}
        {plan && (
          <div className="selected-plan">

            <h2>SELECTED INVESTMENT PLAN</h2>

            <div className="plan-details">

              <div className="plan-detail">
                <span>Plan</span>
                <strong>{plan.name}</strong>
              </div>

              <div className="plan-detail">
                <span>Required Deposit</span>
                <strong>
                  UGX{" "}
                  {Number(
                    plan.investment_amount
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="plan-detail">
                <span>Daily Return</span>
                <strong>
                  UGX{" "}
                  {Number(
                    plan.stated_daily_return
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="plan-detail">
                <span>Investment Period</span>
                <strong>
                  {plan.period_days} days
                </strong>
              </div>

            </div>

          </div>
        )}


        {/* DEPOSIT INSTRUCTIONS */}
        <div className="deposit-instructions">

          <h2>DEPOSIT INSTRUCTIONS</h2>

          <p className="instruction-intro">
            Send the required amount using one of
            the mobile money options below.
          </p>


          {/* AIRTEL */}
          <div className="mobile-money airtel">

           <div className="mobile-money-title">
  <img
    src="/airtel.png"
    alt="Airtel"
    className="mobile-money-logo"
  />
  <h3>AIRTEL MONEY</h3>
</div>

            <p>
              Dial <strong>*185*1#</strong> and follow
              the prompts to send money.
            </p>

            <p>
              Deposit Number:
              <strong> 075XXXXXXX </strong>
             
            </p>
                        <p>
              NAMES:
              <strong>XXXXXX</strong>
              
            </p>

          </div>


          {/* MTN */}
          <div className="mobile-money mtn">

           <div className="mobile-money-title">
  <img
    src="/mtn.png"
    alt="MTN"
    className="mobile-money-logo"
  />
  <h3>MTN MOBILE MONEY</h3>
</div>

            <p>
              Dial <strong>*165*1#</strong> and follow
              the prompts to send money.
            </p>

            <p>
              Deposit Number:
              <strong> 078XXXXXXX</strong>
              
            </p>
                        <p>
              NAMES:
              <strong> XXXXXXX</strong>
              
            </p>

          </div>


          <div className="deposit-warning">

            <p>
              After sending the money, enter the
              phone number you used to make the
              payment below.
            </p>

            <p>
              Your deposit will remain{" "}
              <span className="pending-badge">
                PENDING
              </span>{" "}
              until it has been verified and approved.
            </p>
                        <p>
                Once it is approved, your Purchased Plan will become Active.
            </p>

          </div>

        </div>


        {/* DEPOSIT FORM */}
        <form
          className="deposit-form"
          onSubmit={handleDeposit}
        >

          <div className="form-group">

            <label>DEPOSIT AMOUNT</label>

            <div className="amount-display">
              <span>UGX</span>

              <input
                type="number"
                value={amount}
                readOnly
              />
            </div>

          </div>


          <div className="form-group">

            <label>
              PHONE NUMBER USED FOR DEPOSIT
            </label>

            <input
              type="tel"
              value={reference}
              onChange={(e) =>
                setReference(e.target.value)
              }
              placeholder="Enter phone number"
              required
            />

          </div>


          <button
            className="deposit-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "SUBMITTING..."
              : "SUBMIT DEPOSIT"}
          </button>

        </form>


        {/* BACK BUTTON */}
        <button
          className="back-dashboard"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          BACK TO DASHBOARD
        </button>

      </div>


      {/* PROFESSIONAL POPUP */}
      {showPopup && (
        <div className="deposit-popup-overlay">

          <div className="deposit-popup">

            <h2>{popupTitle}</h2>

            <p>{popupMessage}</p>

            <button
              className="popup-ok-button"
              onClick={closePopup}
            >
              OK
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Deposit;