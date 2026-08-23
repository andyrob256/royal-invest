function About() {
  return (
    <div className="about-page">

      <div className="about-card">

        <h1>ABOUT US</h1>

        {/* ANDRE ROYAL INVEST */}
        <section className="about-introduction">

          <h2>ANDRE ROYAL INVEST</h2>

          <p>
            Andre Royal Invest is an investment platform designed
            to provide individuals with opportunities to grow their
            funds through structured investment plans and a
            transparent referral program.
          </p>

          <p>
            Our platform is built to provide a simple and convenient
            experience, allowing users to select an investment plan,
            monitor their investments, track earnings, and manage
            their withdrawals from one account.
          </p>

        </section>


        {/* OUR MISSION */}
        <section className="about-section">

          <h2>OUR MISSION</h2>

          <p>
            Our mission is to create a simple and accessible
            investment experience while providing our members with
            clear information about their investments, earnings,
            and referral opportunities.
          </p>

        </section>


        {/* OUR VISION */}
        <section className="about-section">

          <h2>OUR VISION</h2>

          <p>
            Our vision is to build a trusted investment community
            where members can participate in structured investment
            opportunities, monitor their progress, and grow together.
          </p>

        </section>


        {/* HOW IT WORKS */}
        <section className="about-section">

          <h2>HOW IT WORKS</h2>

          <p>
            Members can create an account, select an available
            investment plan, make a deposit, and monitor their
            investment through their dashboard.
          </p>

          <p>
            Members can also invite others using their personal
            referral link and earn referral commissions when
            qualifying investments are made within their referral
            network.
          </p>

        </section>


        {/* OUR COMMITMENT */}
        <section className="about-section">

          <h2>OUR COMMITMENT</h2>

          <p>
            We aim to provide a clear and user-friendly platform
            where members can easily access information about their
            investments, earnings, referrals, and withdrawals.
          </p>

        </section>


        {/* BACK TO DASHBOARD */}
        <button
          className="back-dashboard"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          BACK TO DASHBOARD
        </button>

      </div>

    </div>
  );
}

export default About;