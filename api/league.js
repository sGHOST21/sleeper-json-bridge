export default async function handler(req, res) {
  try {
    const leagueId = req.query.league_id;

    if (!leagueId) {
      return res.status(400).json({
        error: "league_id is required"
      });
    }

    const base =
      "https://api.sleeper.app/v1/league/" +
      encodeURIComponent(leagueId);

    const get = async (path) => {
      const response = await fetch(base + path);

      if (!response.ok) {
        throw new Error(path + " failed: " + response.status);
      }

      return response.json();
    };

    const [league, users, rosters, tradedPicks, state] =
      await Promise.all([
        get(""),
        get("/users"),
        get("/rosters"),
        get("/traded_picks"),
        fetch("https://api.sleeper.app/v1/state/nfl").then((r) =>
          r.json()
        )
      ]);

    const week = state.week;
    const transactions = [];

    for (let w = Math.max(1, week - 3); w <= week; w++) {
      const response = await fetch(base + "/transactions/" + w);

      if (response.ok) {
        transactions.push(...(await response.json()));
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      fetched_at: new Date().toISOString(),
      current_week: week,
      league,
      users,
      rosters,
      traded_picks: tradedPicks,
      recent_transactions: transactions
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
