import { useEffect, useState } from "react";

function Referral() {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [totalTeamInvestment, setTotalTeamInvestment] = useState(0);
  const [totalReferralEarnings, setTotalReferralEarnings] = useState(0);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ==========================================
  // PROFESSIONAL POPUP
  // ==========================================

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const showAlert = (title, text) => {
    setPopupTitle(title);
    setPopupMessage(text);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  // ==========================================
  // LOAD REFERRAL INFORMATION
  // ==========================================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);
    setUser(loggedInUser);

    fetch(
      "http://localhost:5000/api/referrals/" +
        loggedInUser.id
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setMessage(data.message);
          return;
        }

        setReferralCode(data.referral_code || "");

        setTotalReferrals(
          Number(data.total_referrals || 0)
        );

        setActiveReferrals(
          Number(data.active_referrals || 0)
        );

        setTotalTeamInvestment(
          Number(data.total_team_investment || 0)
        );

        setTotalReferralEarnings(
          Number(data.total_referral_earnings || 0)
        );

        setReferrals(data.referrals || []);
      })
      .catch((error) => {
        console.error(error);

        setMessage(
          "Unable to load referral information."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ==========================================
  // REFERRAL LINK
  // ==========================================

  const referralLink =
    window.location.origin +
    "/login?ref=" +
    referralCode;

  // ==========================================
  // COPY REFERRAL LINK
  // ==========================================

  const copyReferralLink = async () => {
  try {
    const link = referralLink;

    // Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
    } else {
      // Fallback for mobile browsers
      const textArea = document.createElement("textarea");

      textArea.value = link;

      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "0";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand("copy");

      document.body.removeChild(textArea);
    }

    // Your professional notification can go here
    setMessage("Referral link copied successfully!");

  } catch (error) {
    console.error("COPY REFERRAL LINK ERROR:", error);

    setMessage("Unable to copy referral link.");
  }
};

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="referral-page">
        <h2>
          Loading referral information...
        </h2>
      </div>
    );
  }

  return (
    <div className="referral-page">

      <div className="referral-card">

        {/* ==========================================
            PAGE TITLE
        ========================================== */}

        <h1>MY REFERRALS</h1>


        {/* ==========================================
            GROW YOUR EARNINGS BOX
        ========================================== */}

        <div className="referral-introduction">

          <h2>
            GROW YOUR EARNINGS THROUGH REFERRALS
          </h2>

          <p>
            Invite friends and grow your earnings by
            encouraging them to register and invest
            in our investment plans.
          </p>

          <p>
            <strong>
              Level 1 — 20%:
            </strong>{" "}
            When someone you directly refer makes an
            investment, you earn{" "}
            <strong>
              20% of their active investment.
            </strong>
          </p>

          <p>
            <strong>
              Level 2 — 3%:
            </strong>{" "}
            When someone you directly referred invites
            another person who makes an investment,
            you earn{" "}
            <strong>
              3% of that investment.
            </strong>
          </p>

          <p>
            <strong>
              Level 3 — 1%:
            </strong>{" "}
            When your second-level referral invites
            another person who makes an investment,
            you earn{" "}
            <strong>
              1% of that investment.
            </strong>
          </p>

          <p>
            Your referral commissions are added to your
            earnings and are available for withdrawal
            according to the platform's withdrawal
            requirements.
          </p>

          <p>
            <strong>
              Share your referral link, grow your team,
              and increase your earning potential.
            </strong>
          </p>

        </div>


        {/* ==========================================
            MESSAGE
        ========================================== */}

        {message && (
          <p className="referral-message">
            {message}
          </p>
        )}


        {/* ==========================================
            REFERRAL LINK BOX
        ========================================== */}

        <div className="referral-section referral-link-box">

          <h2>
            YOUR REFERRAL LINK
          </h2>

          <div className="referral-link-row">

            <input
              type="text"
              value={referralLink}
              readOnly
            />

            <button
              onClick={copyReferralLink}
            >
              COPY
            </button>

          </div>

        </div>


        {/* ==========================================
            REFERRAL SUMMARY BOX
        ========================================== */}

        <div className="referral-section referral-summary-box">

          <h2>
            REFERRAL SUMMARY
          </h2>

          <div className="summary-list">

            <div className="summary-item">
              <span>
                TOTAL REFERRALS
              </span>

              <strong>
                {totalReferrals}
              </strong>
            </div>


            <div className="summary-item">
              <span>
                ACTIVE REFERRALS
              </span>

              <strong>
                {activeReferrals}
              </strong>
            </div>


            <div className="summary-item">
              <span>
                TOTAL TEAM INVESTMENT
              </span>

              <strong>
                UGX{" "}
                {totalTeamInvestment.toLocaleString()}
              </strong>
            </div>


            <div className="summary-item">
              <span>
                TOTAL REFERRAL EARNINGS
              </span>

              <strong>
                UGX{" "}
                {totalReferralEarnings.toLocaleString()}
              </strong>
            </div>

          </div>

        </div>


        {/* ==========================================
            REFERRAL TEAM MEMBERS BOX
        ========================================== */}

        <div className="referral-section referral-team-box">

          <h2>
            REFERRAL TEAM MEMBERS
          </h2>

          {referrals.length === 0 ? (

            <p className="no-referrals">
              You have no referrals yet.
            </p>

          ) : (

            <div className="referral-table-container">

              <table className="referral-table">

                <thead>

                  <tr>
                    <th>NAME</th>
                    <th>PHONE NUMBER</th>
                    <th>LEVEL</th>
                    <th>STATUS</th>
                    <th>PLAN</th>
                    <th>AMOUNT</th>
                  </tr>

                </thead>

                <tbody>

                  {referrals.map(
                    (referral) => (

                      <tr key={referral.id}>

                        <td>
                          {referral.full_name}
                        </td>

                        <td>
                          {referral.phone}
                        </td>

                        <td>
                          LEVEL {referral.level}
                        </td>

                        <td>

                          {referral.investment_status ===
                          "active" ? (

                            <span className="active-status">
                              🟢 ACTIVE
                            </span>

                          ) : (

                            <span className="registered-status">
                              ⚪ REGISTERED
                            </span>

                          )}

                        </td>

                        <td>
                          {referral.plan_name
                            ? referral.plan_name
                            : "No Plan"}
                        </td>

                        <td>
                          {referral.investment_amount > 0
                            ? `UGX ${Number(
                                referral.investment_amount
                              ).toLocaleString()}`
                            : "—"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ==========================================
            BACK TO DASHBOARD
        ========================================== */}

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


      {/* ==========================================
          PROFESSIONAL POPUP
      ========================================== */}

      {showPopup && (
        <div className="popup-overlay">

          <div className="popup-box">

            <button
              className="popup-close"
              onClick={closePopup}
            >
              ×
            </button>

            <div className="popup-icon">
              ✓
            </div>

            <h2>
              {popupTitle}
            </h2>

            <p>
              {popupMessage}
            </p>

            <button
              className="popup-button"
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

export default Referral;