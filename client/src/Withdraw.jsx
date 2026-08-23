import { useEffect, useState } from "react";

function Withdraw() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // CUSTOM POPUP
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    type: "normal",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);

    setUser(loggedInUser);

    fetch(
      "http://localhost:5000/api/dashboard/" +
        loggedInUser.id
    )
      .then((response) => response.json())
      .then((data) => {
        setBalance(Number(data.available_balance || 0));
      })
      .catch((error) => {
        console.error(error);

        setMessage("Unable to load your balance.");
      });

    fetch(
      "http://localhost:5000/api/withdrawals/" +
        loggedInUser.id
    )
      .then((response) => response.json())
      .then((data) => {
        setWithdrawals(data.withdrawals || []);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const withdrawalAmount = Number(amount) || 0;

  const charge = withdrawalAmount * 0.10;

  const netAmount = withdrawalAmount - charge;

  // SHOW POPUP
  const showPopup = (
    title,
    popupMessage,
    type = "normal"
  ) => {
    setPopup({
      show: true,
      title: title,
      message: popupMessage,
      type: type,
    });
  };

  // CLOSE POPUP
  const closePopup = () => {
    setPopup({
      show: false,
      title: "",
      message: "",
      type: "normal",
    });
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!user) {
      showPopup(
        "Something Went Wrong",
        "Please login first."
      );
      return;
    }

    if (!phone) {
      showPopup(
        "Something Went Wrong",
        "Please enter your phone number."
      );
      return;
    }

    if (!amount) {
      showPopup(
        "Something Went Wrong",
        "Please enter the withdrawal amount."
      );
      return;
    }

    if (withdrawalAmount < 5000) {
      showPopup(
        "Something Went Wrong",
        "Minimum withdrawal amount is UGX 5,000."
      );
      return;
    }

    if (withdrawalAmount > balance) {
      showPopup(
        "Something Went Wrong",
        "Insufficient available balance."
      );
      return;
    }

    // CONFIRM BEFORE SUBMITTING
    showPopup(
      "Confirm Withdrawal",
      "Are you sure you want to withdraw UGX " +
        withdrawalAmount.toLocaleString() +
        "?\n\n" +
        "Withdrawal charge: UGX " +
        charge.toLocaleString() +
        "\n" +
        "You will receive: UGX " +
        netAmount.toLocaleString(),
      "confirm"
    );
  };

  // ACTUALLY SUBMIT WITHDRAWAL
  const confirmWithdrawal = async () => {
    closePopup();

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/withdrawals",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,
            phone_number: phone,
            amount: withdrawalAmount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAmount("");

        setBalance(
          (currentBalance) =>
            currentBalance - withdrawalAmount
        );

        showPopup(
          "Withdrawal Successful",
          "Your withdrawal request has been submitted successfully."
        );

        // Refresh withdrawal history
        try {
          const historyResponse = await fetch(
            "http://localhost:5000/api/withdrawals/" +
              user.id
          );

          const historyData =
            await historyResponse.json();

          if (historyResponse.ok) {
            setWithdrawals(
              historyData.withdrawals || []
            );
          }
        } catch (historyError) {
          console.error(
            "Unable to refresh withdrawal history:",
            historyError
          );
        }
      } else {
        showPopup(
          "Something Went Wrong",
          data.message ||
            "Unable to submit withdrawal request."
        );
      }
    } catch (error) {
      console.error(error);

      showPopup(
        "Something Went Wrong",
        "Unable to connect to the server. Please try again."
      );
    }

    setSubmitting(false);
  };

  return (
    <div className="withdraw-page">

      <div className="withdraw-card">

        <h1>WITHDRAW FUNDS</h1>

        <div className="withdraw-balance">

          <p>AVAILABLE BALANCE</p>

          <h2>
            UGX {balance.toLocaleString()}
          </h2>

        </div>

        <form onSubmit={handleWithdraw}>

          <label>
            Enter Phone Number:
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Enter phone number"
            required
          />

          <label>
            Enter Withdrawal Amount:
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            placeholder="Enter amount"
            required
          />

          <div className="withdraw-calculation">

            <p>
              Withdraw Charge (10%):

              <strong>
                UGX {charge.toLocaleString()}
              </strong>
            </p>

            <p>
              Net Pay Amount:

              <strong>
                UGX {netAmount.toLocaleString()}
              </strong>
            </p>

          </div>

          <button
            type="submit"
            className="confirm-withdraw-button"
            disabled={submitting}
          >
            {submitting
              ? "SUBMITTING..."
              : "CONFIRM WITHDRAWAL"}
          </button>

        </form>

        {message && (
          <p className="withdraw-message">
            {message}
          </p>
        )}

        <div className="withdraw-notes">

          <h3>NOTE:</h3>

          <p>
            • Minimum withdrawal is UGX 5,000.
          </p>

          <p>
            • A 10% withdrawal charge applies to
            every withdrawal.
          </p>

          <p>
            • Your withdrawal will arrive within
            2 hours after approval.
          </p>

        </div>

        <div className="withdraw-history">

          <h2>WITHDRAWAL HISTORY</h2>

          {loading ? (
            <p>
              Loading withdrawal history...
            </p>
          ) : withdrawals.length === 0 ? (
            <p>
              No withdrawals yet.
            </p>
          ) : (
            withdrawals.map((withdrawal) => (

              <div
                className="withdrawal-item"
                key={withdrawal.id}
              >

                <hr />

                <p>
                  <strong>
                    Date & Time:
                  </strong>{" "}

                  {new Date(
                    withdrawal.created_at
                  ).toLocaleString()}
                </p>

                <p>
                  <strong>
                    Net Amount Paid:
                  </strong>{" "}

                  UGX{" "}
                  {Number(
                    withdrawal.net_amount
                  ).toLocaleString()}
                </p>

                <p>
                  <strong>
                    Phone Number:
                  </strong>{" "}

                  {withdrawal.phone_number}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}

                  {withdrawal.status ===
                  "approved" ? (

                    <span className="withdraw-status paid">
                      PAID
                    </span>

                  ) : (

                    <span className="withdraw-status pending">
                      PENDING
                    </span>

                  )}

                </p>

              </div>

            ))
          )}

        </div>

        <button
          className="back-dashboard"
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
        >
          BACK TO DASHBOARD
        </button>

      </div>

      {/* CUSTOM POPUP */}

      {popup.show && (

        <div className="custom-popup-overlay">

          <div className="custom-popup">

            <h2>
              {popup.title}
            </h2>

            <p>
              {popup.message}
            </p>

            {popup.type === "confirm" ? (

              <div className="withdraw-popup-actions">

                <button
                  className="withdraw-proceed-button"
                  onClick={confirmWithdrawal}
                >
                  PROCEED
                </button>

                <button
                  className="withdraw-cancel-button"
                  onClick={closePopup}
                >
                  CANCEL
                </button>

              </div>

            ) : (

              <button
                className="popup-ok-button"
                onClick={closePopup}
              >
                OK
              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Withdraw;