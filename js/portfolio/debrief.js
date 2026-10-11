// The quarter's debrief (results). Order and content are set in the page plan; this module owns the pieces the
// briefing also needs, so both read the same rule.

// The chain cards a results screen shows: the quarter's biggest bet, and the broken chain if it is still breaking.
export const shownChains = (q) => {
  const bigBet = [...q.rows].sort((a, b) => b.x - a.x)[0], broken = q.rows.find((r) => r.chainOff.kind === "break");
  return [bigBet && bigBet.x ? bigBet : null, broken && broken.id !== bigBet?.id ? broken : null].filter(Boolean);
};
