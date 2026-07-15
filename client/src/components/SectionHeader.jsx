export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && <div className="mb-2 text-xs font-black uppercase text-gold">{eyebrow}</div>}
      <h1 className="section-title">{title}</h1>
      {description && <p className="muted mt-2 max-w-3xl">{description}</p>}
    </div>
  );
}
