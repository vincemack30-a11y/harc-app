import React from "react";
import { SURVEY_URL } from "../data";
import { Link } from "react-router-dom";

export default function Survey() {
  return (
    <div className="card">
      <h1 className="h1">Survey</h1>
      <p className="h2">
        Please complete a quick survey to help improve healthy food access in your community.
      </p>

      <hr className="hr" />

      <a className="btn btn-primary" href={SURVEY_URL} target="_blank" rel="noreferrer">
        Open Survey
      </a>

      <hr className="hr" />

      <div className="row">
        <Link to="/help" className="btn">
          Need Assistance?
        </Link>
        <Link to="/menu" className="btn btn-green">
          Back to Menu
        </Link>
      </div>
    </div>
  );
}
