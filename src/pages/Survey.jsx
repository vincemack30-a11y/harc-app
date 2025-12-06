export default function Survey() {
  const surveyUrl =
    "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

  return (
    <div className="stack">
      <h1 className="page-title">Survey</h1>
      <p className="page-subtitle">
        This survey helps HaRC and Authority Health understand how the coolers
        are working in your neighborhood and what you’d like to see next.
      </p>

      <p className="helper-text">
        When you click the button below, you’ll be taken to our secure survey
        page hosted by MPHI.
      </p>

      <a
        href={surveyUrl}
        target="_blank"
        rel="noreferrer"
        className="button-primary"
      >
        Take the survey
      </a>
    </div>
  );
}
