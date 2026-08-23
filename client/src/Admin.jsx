import { useEffect, useState } from "react";

function Admin() {
  // =====================================================
  // STATE
  // =====================================================

  const [deposits, setDeposits] = useState([]);
  const [approvedDeposits, setApprovedDeposits] = useState([]);

  const [withdrawals, setWithdrawals] = useState([]);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState([]);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Professional notification
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    text: "",
  });

  // Confirmation popup
  const [confirmation, setConfirmation] = useState({
    show: false,
    type: "",
    id: null,
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // PROFESSIONAL NOTIFICATION
  // =====================================================

  const showNotification = (
    type,
    title,
    text
  ) => {
    setNotification({
      show: true,
      type,
      title,
      text,
    });

    setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);
  };

  // =====================================================
  // CLOSE NOTIFICATION
  // =====================================================

  const closeNotification = () => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  };

  // =====================================================
  // PENDING DEPOSITS
  // =====================================================

  const fetchPendingDeposits = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/pending-deposits",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDeposits(data.deposits || []);
      } else {
        setMessage(
          data.message ||
            "Unable to load pending deposits."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server."
      );
    }

    setLoading(false);
  };

  // =====================================================
  // APPROVED DEPOSITS
  // =====================================================

  const fetchApprovedDeposits = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/approved-deposits",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApprovedDeposits(
          data.deposits || []
        );
      } else {
        setMessage(
          data.message ||
            "Unable to load approved deposits."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // PENDING WITHDRAWALS
  // =====================================================

  const fetchPendingWithdrawals = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/pending-withdrawals",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWithdrawals(
          data.withdrawals || []
        );
      } else {
        setMessage(
          data.message ||
            "Unable to load pending withdrawals."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // APPROVED WITHDRAWALS
  // =====================================================

  const fetchApprovedWithdrawals = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/approved-withdrawals",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApprovedWithdrawals(
          data.withdrawals || []
        );
      } else {
        setMessage(
          data.message ||
            "Unable to load approved withdrawals."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // USER MONITORING
  // =====================================================

  const fetchUserMonitoring = async () => {
    try {
      setUsersLoading(true);

      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/admin/user-monitoring",
        {
          headers: {
            Authorization:
              "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error(
          "User monitoring error:",
          data.message
        );

        setUsers([]);
      }
    } catch (error) {
      console.error(
        "User monitoring error:",
        error
      );

      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  useEffect(() => {
    fetchPendingDeposits();
    fetchApprovedDeposits();

    fetchPendingWithdrawals();
    fetchApprovedWithdrawals();

    fetchUserMonitoring();
  }, []);

  // =====================================================
  // APPROVE DEPOSIT
  // =====================================================

  const approveDeposit = async (
    depositId
  ) => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/approve-deposit",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " + token,
          },

          body: JSON.stringify({
            deposit_id: depositId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showNotification(
          "success",
          "Deposit Approved",
          "The deposit has been approved successfully."
        );

        fetchPendingDeposits();
        fetchApprovedDeposits();
        fetchUserMonitoring();
      } else {
        showNotification(
          "error",
          "Approval Failed",
          data.message ||
            "Unable to approve the deposit."
        );
      }
    } catch (error) {
      console.error(error);

      showNotification(
        "error",
        "Connection Error",
        "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // APPROVE WITHDRAWAL (FIXED)
  // =====================================================

  const approveWithdrawal = async (
    withdrawalId
  ) => {
    try {
      const token = getToken();

      console.log("🟢 Approving withdrawal ID:", withdrawalId);

      const response = await fetch(
        "http://localhost:5000/api/approve-withdrawal",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " + token,
          },

          body: JSON.stringify({
            withdrawal_id:
              withdrawalId,
          }),
        }
      );

      const data = await response.json();

      console.log("📡 Response status:", response.status);
      console.log("📦 Response data:", data);

      // Check if the response is successful (status 200-299)
      if (response.status === 200 || response.status === 201) {
        showNotification(
          "success",
          "✅ Withdrawal Approved",
          data.message || "The withdrawal has been approved successfully."
        );

        // Refresh all lists
        await fetchPendingWithdrawals();
        await fetchApprovedWithdrawals();
        await fetchUserMonitoring();
      } else {
        // Show the error message from the backend
        showNotification(
          "error",
          "❌ Approval Failed",
          data.message || "Unable to approve the withdrawal."
        );
      }
    } catch (error) {
      console.error("❌ Approve withdrawal error:", error);

      showNotification(
        "error",
        "Connection Error",
        "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // REJECT WITHDRAWAL
  // =====================================================

  const rejectWithdrawal = async (
    withdrawalId
  ) => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://localhost:5000/api/reject-withdrawal",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " + token,
          },

          body: JSON.stringify({
            withdrawal_id:
              withdrawalId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showNotification(
          "success",
          "Withdrawal Rejected",
          "The withdrawal request has been rejected."
        );

        fetchPendingWithdrawals();
        fetchUserMonitoring();
      } else {
        showNotification(
          "error",
          "Rejection Failed",
          data.message ||
            "Unable to reject the withdrawal."
        );
      }
    } catch (error) {
      console.error(error);

      showNotification(
        "error",
        "Connection Error",
        "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // CONFIRM ACTION
  // =====================================================

  const openConfirmation = (
    type,
    id
  ) => {
    setConfirmation({
      show: true,
      type,
      id,
    });
  };

  // =====================================================
  // CONFIRM ACTION HANDLER
  // =====================================================

  const confirmAction = async () => {
    const type = confirmation.type;
    const id = confirmation.id;

    setConfirmation({
      show: false,
      type: "",
      id: null,
    });

    if (type === "approveDeposit") {
      await approveDeposit(id);
    }

    if (type === "approveWithdrawal") {
      await approveWithdrawal(id);
    }

    if (type === "rejectWithdrawal") {
      await rejectWithdrawal(id);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString();
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "N/A";
    }

    return parsedDate.toLocaleString();
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className="admin-page"
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: "30px",
        color: "#222",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #111827, #1f2937)",
          color: "white",
          padding: "25px 30px",
          borderRadius: "16px",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow:
            "0 8px 25px rgba(0,0,0,0.12)",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              letterSpacing: "1px",
            }}
          >
            ADMIN DASHBOARD
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              opacity: 0.75,
            }}
          >
            Manage deposits, withdrawals
            and users
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding:
              "11px 20px",
            borderRadius: "9px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          LOG OUT
        </button>
      </div>

      {message && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {message}
        </div>
      )}

      {/* =================================================
          PENDING DEPOSITS
      ================================================= */}

      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "25px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          PENDING DEPOSITS
        </h2>

        {loading ? (
          <p>Loading deposits...</p>
        ) : deposits.length === 0 ? (
          <p>
            No pending deposits.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "950px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f3f4f6",
                  }}
                >
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {deposits.map(
                  (deposit) => (
                    <tr
                      key={
                        deposit.id
                      }
                    >
                      <td>
                        {
                          deposit.full_name
                        }
                      </td>

                      <td>
                        {
                          deposit.phone_number
                        }
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          deposit.amount
                        )}
                      </td>

                      <td>
                        {
                          deposit.plan_name
                        }
                      </td>

                      <td>
                        <span
                          style={{
                            background:
                              "#fef3c7",
                            color:
                              "#92400e",
                            padding:
                              "5px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",
                          }}
                        >
                          {String(
                            deposit.status
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          deposit.created_at
                        )}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            openConfirmation(
                              "approveDeposit",
                              deposit.id
                            )
                          }
                          style={{
                            background:
                              "#16a34a",
                            color:
                              "white",
                            border:
                              "none",
                            padding:
                              "8px 15px",
                            borderRadius:
                              "7px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "700",
                          }}
                        >
                          APPROVE
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          APPROVED DEPOSITS
      ================================================= */}

      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "25px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          APPROVED DEPOSITS
        </h2>

        {approvedDeposits.length ===
        0 ? (
          <p>
            No approved deposits.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "850px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f3f4f6",
                  }}
                >
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {approvedDeposits.map(
                  (deposit) => (
                    <tr
                      key={
                        deposit.id
                      }
                    >
                      <td>
                        {
                          deposit.full_name
                        }
                      </td>

                      <td>
                        {
                          deposit.phone_number
                        }
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          deposit.amount
                        )}
                      </td>

                      <td>
                        {
                          deposit.plan_name
                        }
                      </td>

                      <td>
                        <span
                          style={{
                            color:
                              "#15803d",
                            fontWeight:
                              "700",
                          }}
                        >
                          {String(
                            deposit.status
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          deposit.created_at
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          PENDING WITHDRAWALS
      ================================================= */}

      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "25px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          PENDING WITHDRAWALS
        </h2>

        {withdrawals.length ===
        0 ? (
          <p>
            No pending withdrawals.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1100px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f3f4f6",
                  }}
                >
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Charge</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map(
                  (withdrawal) => (
                    <tr
                      key={
                        withdrawal.id
                      }
                    >
                      <td>
                        {
                          withdrawal.full_name
                        }
                      </td>

                      <td>
                        {
                          withdrawal.phone_number
                        }
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          withdrawal.amount
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          withdrawal.charge
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          withdrawal.net_amount
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            background:
                              "#fef3c7",
                            color:
                              "#92400e",
                            padding:
                              "5px 10px",
                            borderRadius:
                              "20px",
                            fontWeight:
                              "700",
                            fontSize:
                              "12px",
                          }}
                        >
                          {String(
                            withdrawal.status
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          withdrawal.created_at
                        )}
                      </td>

                      <td
                        style={{
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            openConfirmation(
                              "approveWithdrawal",
                              withdrawal.id
                            )
                          }
                          style={{
                            background:
                              "#16a34a",
                            color:
                              "white",
                            border:
                              "none",
                            padding:
                              "8px 14px",
                            borderRadius:
                              "7px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "700",
                            marginRight:
                              "7px",
                          }}
                        >
                          APPROVE
                        </button>

                        <button
                          onClick={() =>
                            openConfirmation(
                              "rejectWithdrawal",
                              withdrawal.id
                            )
                          }
                          style={{
                            background:
                              "#dc2626",
                            color:
                              "white",
                            border:
                              "none",
                            padding:
                              "8px 14px",
                            borderRadius:
                              "7px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "700",
                          }}
                        >
                          REJECT
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          APPROVED WITHDRAWALS
      ================================================= */}

      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "25px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          APPROVED WITHDRAWALS
        </h2>

        {approvedWithdrawals.length ===
        0 ? (
          <p>
            No approved withdrawals.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1000px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f3f4f6",
                  }}
                >
                  <th>User</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Charge</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {approvedWithdrawals.map(
                  (withdrawal) => (
                    <tr
                      key={
                        withdrawal.id
                      }
                    >
                      <td>
                        {
                          withdrawal.full_name
                        }
                      </td>

                      <td>
                        {
                          withdrawal.phone_number
                        }
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          withdrawal.amount
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          withdrawal.charge
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          withdrawal.net_amount
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            color:
                              "#15803d",
                            fontWeight:
                              "700",
                          }}
                        >
                          {String(
                            withdrawal.status
                          ).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          withdrawal.created_at
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          USER MONITORING
      ================================================= */}

      <section
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          marginBottom: "25px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.07)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          USER MONITORING
        </h2>

        {usersLoading ? (
          <p>
            Loading user monitoring
            data...
          </p>
        ) : users.length === 0 ? (
          <p>
            No users found.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth:
                  "1200px",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#111827",
                    color:
                      "white",
                  }}
                >
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                  <th>Total Investment</th>
                  <th>Investment Earnings</th>
                  <th>Referral Earnings</th>
                  <th>Total Earnings</th>
                  <th>Total Withdrawals</th>
                  <th>Available Balance</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (user) => (
                    <tr
                      key={
                        user.id
                      }
                    >
                      <td>
                        {user.id}
                      </td>

                      <td
                        style={{
                          fontWeight:
                            "700",
                        }}
                      >
                        {
                          user.full_name
                        }
                      </td>

                      <td>
                        {
                          user.phone_number
                        }
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          user.total_investment
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          user.investment_earnings
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          user.referral_earnings
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          user.total_earnings
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          user.total_withdrawals
                        )}
                      </td>

                      <td>
                        UGX{" "}
                        {formatMoney(
                          user.available_balance
                        )}
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            setSelectedUser(
                              user
                            )
                          }
                          style={{
                            background:
                              "#2563eb",
                            color:
                              "white",
                            border:
                              "none",
                            padding:
                              "8px 15px",
                            borderRadius:
                              "7px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "700",
                          }}
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          BACK TO DASHBOARD
      ================================================= */}

      <button
        onClick={() => {
          window.location.href =
            "/dashboard";
        }}
        style={{
          background:
            "#374151",
          color: "white",
          border: "none",
          padding:
            "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "700",
        }}
      >
        BACK TO DASHBOARD
      </button>

      {/* =================================================
          USER DETAILS POPUP
      ================================================= */}

      {selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background:
                "white",
              width: "100%",
              maxWidth:
                "700px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              borderRadius:
                "18px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >

            {/* HEADER */}

            <div
              style={{
                background:
                  "linear-gradient(135deg, #111827, #1f2937)",
                color:
                  "white",
                padding:
                  "20px 25px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                USER DETAILS
              </h2>

              <button
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                style={{
                  background:
                    "transparent",
                  border:
                    "none",
                  color:
                    "white",
                  fontSize:
                    "28px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* USER NAME */}

            <div
              style={{
                padding:
                  "25px",
                background:
                  "#f9fafb",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                {
                  selectedUser.full_name
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                }}
              >
                USER ID: #
                {
                  selectedUser.id
                }
              </p>
            </div>

            {/* PERSONAL INFORMATION */}

            <div
              style={{
                padding:
                  "25px",
              }}
            >
              <h3>
                PERSONAL INFORMATION
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    background:
                      "#f9fafb",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    FULL NAME
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    {
                      selectedUser.full_name
                    }
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#f9fafb",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    USER ID
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    #
                    {
                      selectedUser.id
                    }
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#f9fafb",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    PHONE NUMBER
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    {
                      selectedUser.phone_number
                    }
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#f9fafb",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    EMAIL
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    {
                      selectedUser.email ||
                      "N/A"
                    }
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#f9fafb",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                    gridColumn:
                      "span 2",
                  }}
                >
                  <small>
                    DATE JOINED
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    {formatDate(
                      selectedUser.created_at
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* FINANCIAL INFORMATION */}

            <div
              style={{
                padding:
                  "25px",
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >
              <h3>
                FINANCIAL INFORMATION
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "15px",
                }}
              >

                <div
                  style={{
                    background:
                      "#eff6ff",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    TOTAL INVESTMENT
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      selectedUser.total_investment
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#ecfdf5",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    INVESTMENT EARNINGS
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      selectedUser.investment_earnings
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#f5f3ff",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    REFERRAL EARNINGS
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      selectedUser.referral_earnings
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#ecfdf5",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    TOTAL EARNINGS
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      selectedUser.total_earnings
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#fff7ed",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    TOTAL WITHDRAWALS
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      selectedUser.total_withdrawals
                    )}
                  </strong>
                </div>

                {/* PROFIT */}

                <div
                  style={{
                    background:
                      "#f0fdf4",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid #86efac",
                  }}
                >
                  <small>
                    PROFIT
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      color:
                        "#15803d",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      Number(
                        selectedUser.total_withdrawals ||
                          0
                      ) -
                        Number(
                          selectedUser.total_investment ||
                            0
                        )
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      "#fefce8",
                    padding:
                      "15px",
                    borderRadius:
                      "10px",
                    gridColumn:
                      "span 2",
                  }}
                >
                  <small>
                    AVAILABLE BALANCE
                  </small>

                  <strong
                    style={{
                      display:
                        "block",
                      marginTop:
                        "5px",
                      fontSize:
                        "20px",
                    }}
                  >
                    UGX{" "}
                    {formatMoney(
                      selectedUser.available_balance
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* CLOSE */}

            <div
              style={{
                padding:
                  "0 25px 25px",
                textAlign:
                  "right",
              }}
            >
              <button
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                style={{
                  background:
                    "#374151",
                  color:
                    "white",
                  border:
                    "none",
                  padding:
                    "11px 25px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "700",
                }}
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================
          CONFIRMATION POPUP
      ================================================= */}

      {confirmation.show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 2000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background:
                "white",
              width: "100%",
              maxWidth:
                "420px",
              borderRadius:
                "16px",
              padding:
                "30px",
              textAlign:
                "center",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >

            <div
              style={{
                width: "60px",
                height: "60px",
                margin:
                  "0 auto 15px",
                borderRadius:
                  "50%",
                background:
                  confirmation.type ===
                    "rejectWithdrawal"
                    ? "#fee2e2"
                    : "#dcfce7",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "28px",
              }}
            >
              {confirmation.type ===
              "rejectWithdrawal"
                ? "!"
                : "✓"}
            </div>

            <h2>
              {confirmation.type ===
              "rejectWithdrawal"
                ? "Reject Withdrawal?"
                : confirmation.type ===
                  "approveDeposit"
                ? "Approve Deposit?"
                : "Approve Withdrawal?"}
            </h2>

            <p
              style={{
                color:
                  "#6b7280",
                lineHeight:
                  "1.6",
              }}
            >
              {confirmation.type ===
              "rejectWithdrawal"
                ? "Are you sure you want to reject this withdrawal request?"
                : "Are you sure you want to approve this transaction?"}
            </p>

            <div
              style={{
                display:
                  "flex",
                gap: "10px",
                justifyContent:
                  "center",
                marginTop:
                  "25px",
              }}
            >
              <button
                onClick={() =>
                  setConfirmation({
                    show: false,
                    type: "",
                    id: null,
                  })
                }
                style={{
                  background:
                    "#e5e7eb",
                  color:
                    "#374151",
                  border:
                    "none",
                  padding:
                    "11px 22px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "700",
                }}
              >
                CANCEL
              </button>

              <button
                onClick={
                  confirmAction
                }
                style={{
                  background:
                    confirmation.type ===
                    "rejectWithdrawal"
                      ? "#dc2626"
                      : "#16a34a",
                  color:
                    "white",
                  border:
                    "none",
                  padding:
                    "11px 22px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "700",
                }}
              >
                {confirmation.type ===
                "rejectWithdrawal"
                  ? "YES, REJECT"
                  : "YES, APPROVE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          PROFESSIONAL NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          style={{
            position: "fixed",
            top: "25px",
            right: "25px",
            width: "360px",
            maxWidth:
              "calc(100vw - 50px)",
            background:
              "white",
            borderRadius:
              "14px",
            padding:
              "18px 20px",
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.2)",
            zIndex: 3000,
            borderLeft:
              notification.type ===
              "success"
                ? "5px solid #16a34a"
                : "5px solid #dc2626",
            display:
              "flex",
            alignItems:
              "flex-start",
            gap: "13px",
          }}
        >

          <div
            style={{
              width: "40px",
              height: "40px",
              minWidth: "40px",
              borderRadius:
                "50%",
              background:
                notification.type ===
                "success"
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                notification.type ===
                "success"
                  ? "#15803d"
                  : "#b91c1c",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontSize:
                "20px",
              fontWeight:
                "bold",
            }}
          >
            {notification.type ===
            "success"
              ? "✓"
              : "!"}
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 5px",
                fontSize:
                  "16px",
              }}
            >
              {
                notification.title
              }
            </h3>

            <p
              style={{
                margin: 0,
                color:
                  "#6b7280",
                fontSize:
                  "14px",
                lineHeight:
                  "1.5",
              }}
            >
              {
                notification.text
              }
            </p>
          </div>

          <button
            onClick={
              closeNotification
            }
            style={{
              background:
                "transparent",
              border:
                "none",
              color:
                "#9ca3af",
              fontSize:
                "20px",
              cursor:
                "pointer",
            }}
          >
            ×
          </button>

        </div>
      )}

    </div>
  );
}

export default Admin;