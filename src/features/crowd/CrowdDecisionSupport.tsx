import { crowdLocations } from "../../shared/stadium/stadiumData";

export function CrowdDecisionSupport() {
  return (
    <section className="panel" aria-labelledby="crowd-heading">
      <div className="section-heading">
        <p className="eyebrow">Module 2</p>
        <h2 id="crowd-heading">Crowd and Operations Decision Support</h2>
      </div>
      <div className="location-grid">
        {crowdLocations.map((location) => (
          <article className="location-card" key={location.id}>
            <h3>{location.name}</h3>
            <dl>
              <div>
                <dt>Crowd status</dt>
                <dd>
                  <span className={`status status-${location.crowdStatus.toLowerCase()}`}>{location.crowdStatus}</span>
                </dd>
              </div>
              <div>
                <dt>Waiting time</dt>
                <dd>{location.waitingTimeCategory}</dd>
              </div>
              <div>
                <dt>Alternative</dt>
                <dd>{location.recommendedAlternative}</dd>
              </div>
              <div>
                <dt>Recommended action</dt>
                <dd>{location.recommendedAction}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
