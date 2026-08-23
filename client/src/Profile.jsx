import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/";
      return;
    }

    const loggedInUser = JSON.parse(savedUser);

    fetch(
      "http://localhost:5000/api/profile/" + loggedInUser.id
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        return response.json();
      })
      .then((data) => {
       console.log(
  "PROFILE DATA:",
  JSON.stringify(data, null, 2)
);
        setUser(data);
      })
      .catch((error) => {
        console.error("Profile error:", error);
      });
  }, []);

  if (!user) {
    return (
      <div className="profile-loading">
        <p>Loading account...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="profile-header">
        <h1>MY ACCOUNT</h1>

        <p>
          Manage your account information and access
          your investment activities.
        </p>
      </div>


      {/* =========================================
          PROFILE CARD
      ========================================= */}

      <div className="profile-main-card">

        <div className="profile-avatar">
          {user.full_name
            ? user.full_name.charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="profile-main-info">

          <h2>{user.full_name || "N/A"}</h2>

          <p>
            Account ID: #{user.id}
          </p>

          <span className="account-status">
            ● ACTIVE ACCOUNT
          </span>

        </div>

      </div>


      {/* =========================================
          PERSONAL INFORMATION
      ========================================= */}

      <div className="profile-section">

        <h2>PERSONAL INFORMATION</h2>

        <div className="profile-info-grid">

          <div className="profile-info-box">

            <span>FULL NAME</span>

            <strong>
              {user.full_name || "N/A"}
            </strong>

          </div>


          <div className="profile-info-box">

            <span>PHONE NUMBER</span>

            <strong>
              {user.phone || "N/A"}
            </strong>

          </div>


          <div className="profile-info-box">

            <span>EMAIL ADDRESS</span>

            <strong>
              {user.email || "N/A"}
            </strong>

          </div>


          <div className="profile-info-box">

            <span>USER ID</span>

            <strong>
              #{user.id}
            </strong>

          </div>


          <div className="profile-info-box">

            <span>ACCOUNT CREATED</span>

            <strong>
              {user.created_at
                ? new Date(
                    user.created_at
                  ).toLocaleDateString()
                : "Not available"}
            </strong>

          </div>


          <div className="profile-info-box">

            <span>ACCOUNT STATUS</span>

            <strong className="active-text">
              ACTIVE
            </strong>

          </div>

        </div>

      </div>


      {/* =========================================
          ACCOUNT OVERVIEW
      ========================================= */}

      <div className="profile-section">

        <h2>ACCOUNT OVERVIEW</h2>

        <div className="profile-overview-grid">


          {/* TOTAL INVESTMENT */}

          <div className="overview-card">

            <div className="overview-icon">
              💰
            </div>

            <div>

              <span>
                TOTAL INVESTMENT
              </span>

              <strong>
                UGX{" "}
                {Number(
                  user.total_investment || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>


          {/* TOTAL EARNINGS */}

          <div className="overview-card">

            <div className="overview-icon">
              📈
            </div>

            <div>

              <span>
                TOTAL EARNINGS
              </span>

              <strong className="profit-value">
                UGX{" "}
                {Number(
                  user.total_earnings || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>


          {/* TOTAL WITHDRAWALS */}

          <div className="overview-card">

            <div className="overview-icon">
              💸
            </div>

            <div>

              <span>
                TOTAL WITHDRAWALS
              </span>

              <strong className="withdrawal-value">
                UGX{" "}
                {Number(
                  user.total_withdrawals || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>


          {/* AVAILABLE BALANCE */}

          <div className="overview-card">

            <div className="overview-icon">
              💵
            </div>

            <div>

              <span>
                AVAILABLE BALANCE
              </span>

              <strong className="balance-value">
                UGX{" "}
                {Number(
                  user.available_balance || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>


          {/* INVESTMENT EARNINGS */}

          <div className="overview-card">

            <div className="overview-icon">
              📊
            </div>

            <div>

              <span>
                INVESTMENT EARNINGS
              </span>

              <strong>
                UGX{" "}
                {Number(
                  user.investment_earnings || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>


          {/* REFERRAL EARNINGS */}

          <div className="overview-card">

            <div className="overview-icon">
              👥
            </div>

            <div>

              <span>
                REFERRAL EARNINGS
              </span>

              <strong>
                UGX{" "}
                {Number(
                  user.referral_earnings || 0
                ).toLocaleString()}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          QUICK ACTIONS
      ========================================= */}

      <div className="profile-section">

        <h2>QUICK ACTIONS</h2>

        <div className="profile-actions">

          <button
            className="profile-action-button"
            onClick={() => {
              window.location.href =
                "/dashboard";
            }}
          >
            DASHBOARD
          </button>


          <button
            className="profile-action-button"
            onClick={() => {
              window.location.href =
                "/plans";
            }}
          >
            MY INVESTMENTS
          </button>


          <button
            className="profile-action-button"
            onClick={() => {
              window.location.href =
                "/withdraw";
            }}
          >
            WITHDRAW
          </button>

        </div>

      </div>


      {/* =========================================
          BACK TO DASHBOARD
      ========================================= */}

      <button
        className="profile-back-button"
        onClick={() => {
          window.location.href =
            "/dashboard";
        }}
      >
        ← BACK TO DASHBOARD
      </button>

    </div>
  );
}

export default Profile;