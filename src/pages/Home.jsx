import React from "react";
import { Link } from "react-router-dom";

export default function Home({ ctx }) {
  return (
    <div className="card">
      <h1 className="h1">Welcome</h1>
      <p className="h2">
        Find a cooler location, browse the menu, place an order, and complete a quick survey.
      </p>

      <hr className="hr" />

      <div className="row">
        <Link to="/coolers" className="btn btn-primary">
          Select a Cooler
        </Link>
        <Link to="/help" className="btn">
          Get Help
        </Link>
        <a className="btn" href="https://authorityhealth.org" target="_blank" rel="noreferrer">
          Authority Health
        </a>
      </div>

      <hr className="hr" />

      <div className="small">
        Tip: Cooler selection resets your cart to keep ordering clean by site.
      </div>
    </div>
  );
}
