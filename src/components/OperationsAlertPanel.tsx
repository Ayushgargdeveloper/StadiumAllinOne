import { operationsAlerts } from "../data/stadiumData";

export function OperationsAlertPanel() {
  return (
    <section className="panel" aria-labelledby="alerts-heading">
      <div className="section-heading">
        <p className="eyebrow">Operations intelligence</p>
        <h2 id="alerts-heading">Operations Alert Panel</h2>
      </div>
      <div className="alert-list">
        {operationsAlerts.map((alert) => (
          <article className="alert-card" key={alert.id}>
            <h3>{alert.title}</h3>
            <p>
              <strong>Severity:</strong> {alert.severity}
            </p>
            <p>
              <strong>Location:</strong> {alert.location}
            </p>
            <p>
              <strong>Responsible team:</strong> {alert.responsibleTeam}
            </p>
            <p>
              <strong>Recommended response:</strong> {alert.recommendedResponse}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
