export default async function handler(req, res) {
  try {
    const username = "ShaneI";

    const userResponse = await fetch(
      "https://api.sleeper.app/v1/user/" + encodeURIComponent(username)
    );

    if (!userResponse.ok) {
      throw new Error(
        "Sleeper user lookup failed: " + userResponse.status
      );
    }

    const user = await userResponse.json();

    const leaguesResponse = await fetch(
      "https://api.sleeper.app/v1/user/" +
        user.user_id +
        "/leagues/nfl/2026"
    );

    if (!leaguesResponse.ok) {
      throw new Error(
        "Sleeper leagues lookup failed: " + leaguesResponse.status
      );
    }

    const leagues = await leaguesResponse.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      source: "Sleeper API",
      username,
      user_id: user.user_id,
      season: "2026",
      leagues
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
