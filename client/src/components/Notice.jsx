/** Frontend owner: AHSAS ZAIDI. */
export default function Notice({ type = "info", children }) {
  return children ? <div className={`notice ${type}`} role="status">{children}</div> : null;
}
