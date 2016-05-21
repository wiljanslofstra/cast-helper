export default function extend(base, ...parts) {
  const res = base;

  parts.forEach((p) => {
    if (p && typeof (p) === 'object') {
      for (const k in p) {
        if (p.hasOwnProperty(k)) {
          res[k] = p[k];
        }
      }
    }
  });

  return res;
}
