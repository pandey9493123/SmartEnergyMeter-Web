import './TeamSection.css';

export default function TeamSection() {
  return (
    <div className="team-container">
      <div className="team-header">
        <h1>Project Team</h1>
        <p>Government Polytechnic College, Sangareddy</p>
      </div>

      {/* TIER 1: Leader and Core Developer (Always grouped together) */}
      <div className="team-tier-one">
        {/* Srilaxmi - Team Leader */}
        <div className="team-card leader">
          <div className="team-role">Team Leader</div>
          <div className="team-name">Srilaxmi</div>
          <ul className="team-details">
            <li>Project Management & Coordination</li>
            <li>System Architecture Planning</li>
            <li>Final Presentation Delivery</li>
          </ul>
        </div>

        {/* Om Pandey - Immediately next to Srilaxmi */}
        <div className="team-card adjacent">
          <div className="team-role">Embedded & Software Development</div>
          <div className="team-name">Om Pandey</div>
          <ul className="team-details">
            <li>ESP32 Firmware Programming</li>
            <li>Firebase & IoT Integration</li>
            <li>React Web Application Development</li>
            <li>Legacy Blynk Integration</li>
          </ul>
        </div>
      </div>

      {/* TIER 2: Remaining Team Members */}
      <div className="team-tier-two">
        <div className="team-card">
          <div className="team-role">Vice Leader</div>
          <div className="team-name">Varshitha</div>
          <ul className="team-details">
            <li>Team Coordination Support</li>
            <li>Project Logistics</li>
          </ul>
        </div>

        <div className="team-card">
          <div className="team-role">Hardware Implementation & Integration</div>
          <div className="team-name">Mourya Vardhan</div>
          <ul className="team-details">
            <li>Physical Hardware Connections</li>
            <li>Circuit Wiring & Soldering</li>
            <li>Hardware Component Assembly</li>
          </ul>
        </div>

        <div className="team-card">
          <div className="team-role">Technical Writing & Project Documentation</div>
          <div className="team-name">Akshitha</div>
          <ul className="team-details">
            <li>Technical Manual Generation</li>
            <li>Architecture Documentation</li>
          </ul>
        </div>

        <div className="team-card">
          <div className="team-role">Documentation & Presentation</div>
          <div className="team-name">Manyatha</div>
          <ul className="team-details">
            <li>PPT Preparation</li>
            <li>Academic Reporting</li>
          </ul>
        </div>

        <div className="team-card">
          <div className="team-role">Research</div>
          <div className="team-name">Shiva Sai</div>
          <ul className="team-details">
            <li>Component Analysis</li>
            <li>Safety Standards Research</li>
          </ul>
        </div>
      </div>
    </div>
  );
}