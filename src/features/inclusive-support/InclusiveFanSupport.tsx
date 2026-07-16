import { inclusiveSupportGroups } from "../../shared/stadium/stadiumData";

export function InclusiveFanSupport() {
  return (
    <section className="panel" aria-labelledby="inclusive-heading">
      <div className="section-heading">
        <p className="eyebrow">Module 3</p>
        <h2 id="inclusive-heading">Inclusive Fan Support</h2>
      </div>
      <div className="support-grid">
        {inclusiveSupportGroups.map((group) => (
          <article className="support-card" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
