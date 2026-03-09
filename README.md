# Pulse Circuit

Pulse Circuit is a short-session arcade strategy game built around **thermal polarity routing**.

## One-sentence rule
Before each pulse lands, rotate the ring and optionally flip the top node so its polarity matches the pulse, because mismatches overheat the circuit and end the run.

## Addictive design analysis (and anti-clone constraints)
To make a game feel addictive without copying saturated genres, this project leans on proven behavioral loops while avoiding banned templates:

1. **Rapid action-feedback coupling** — every ~0.3s to 1.0s, a pulse resolves and immediately changes score, heat, and tempo.
2. **Layered decisions** — micro choice (rotate/flip now) plus macro risk management (which node to sacrifice, which to preserve).
3. **Escalating pressure** — pulse tempo accelerates with score, forcing adaptation and flow-state focus.
4. **Near-miss tension** — heat meters create visible danger, producing "save it at the last second" moments.
5. **Short run, persistent mastery** — runs end quickly, but skill transfer and a visible best score drive "one more run" behavior.

This is explicitly not a survivor-like, idle game, endless runner, match-3, flappy style game, deckbuilder, or auto-battler.

## Candidate core loops explored (5)
1. **Gravity Draft**: pull resource shards with directional gravity bursts while avoiding orbital collisions.
2. **Pulse Circuit** (chosen): rotate a node ring to align polarity with incoming pulses before impact.
3. **Echo Locksmith**: open shifting locks by reproducing micro-rhythms while noise corrupts old inputs.
4. **Fog Cartographer**: draw temporary paths through collapsing fog islands to connect vanishing beacons.
5. **Signal Braiding**: weave crossing signal strands in real-time while preventing same-frequency interference.

## Why Pulse Circuit was chosen
- It has a one-line teachable rule.
- It creates meaningful decisions every second or less.
- It supports 1–3 minute sessions naturally through rising tempo and overheats.
- It is mechanically distinct from common addictive genres.
- It enables high replayability through skill expression, combo chasing, and unstable heat states.

## Running locally
Open `index.html` in a browser, or run:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.
