import { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const SHIPS = [
  {
    id: "lincoln", coords: [62, 20], type: "csg", label: "CVN-72 Lincoln CSG",
    detail: "Arabian Sea — Primary strike carrier, Op. Epic Fury since Feb 28. CAW-9: F/A-18E/F (VFA-14, 41, 151), F-35C (VMFA-314), EA-18G (VAQ-133), E-2D (VAW-117). Escorts include USS Spruance (DDG-111) — which fired on M/V Touska Apr 19 — USS Petersen (DDG-121), plus 7 independent DDGs. Supported by USNS Kaiser & John Lewis oilers."
  },
  {
    id: "tripoli", coords: [64, 22.5], type: "arg", label: "LHA-7 Tripoli ARG",
    detail: "CENTCOM AOR — America-class LHA with USS New Orleans (LPD-18), USS Rushmore (LSD-47), 31st MEU. 31st MEU marines boarded and seized M/V Touska on Apr 19 after Spruance disabled her propulsion. First hostile boarding of the blockade."
  },
  {
    id: "touska", coords: [60.5, 23.5], type: "incident", label: "⚠ M/V TOUSKA SEIZED Apr 19",
    detail: "BLOCKADE ENFORCEMENT — Iranian-flagged container ship (294m, 4,795 TEU, OFAC-sanctioned since 2018), inbound from Shanghai/Singapore to Bandar Abbas at 17 kts. USS Spruance (DDG-111) warned for 6 hours. After crew refused to comply, Spruance fired Mk 45 5-inch gun rounds into engine room (≥3 rounds observed). Ship disabled, 31st MEU marines from Tripoli boarded and took custody. 80,000-ton vessel — can't be towed by a DDG. MSC tug Catawba was evacuated to Singapore. No cranes at Diego Garcia to offload containers for inspection."
  },
  {
    id: "friday1", coords: [56.3, 26.3], type: "incident", label: "⚠ IRGC attacks Apr 18",
    detail: "STRAIT OF HORMUZ — Three IRGC attacks on commercial shipping as tankers tried to break out after both sides said strait was open. 09:20 UTC: M/V San Mar Herald machine-gunned by 2 IRGC gunboats. 11:25 UTC: CMA CGM Everglade attacked (machine guns). 12:08 UTC: Passenger ship reported projectiles falling in water."
  },
  {
    id: "ford", coords: [27, 34.5], type: "csg", label: "CVN-78 Ford CSG",
    detail: "Eastern Mediterranean — Transited Suez Mar 5, returned after fire for repairs at Crete/Split. Too far to support Hormuz blockade without another Suez transit or Africa route. Supporting Lebanon war / eastern Med air defense."
  },
  {
    id: "bush", coords: [12, -22], type: "csg", label: "CVN-77 Bush CSG",
    detail: "Off Namibia — Deployed end of March. Avoided Gibraltar, Suez, Bab el-Mandeb. No US carrier has transited Bab el-Mandeb since USS Eisenhower Dec 2023. Escorts: USS Donald Cook (DDG-75), USS Mason (DDG-87), USS Ross (DDG-71) + USNS Arctic (T-AOE-8), 30+ kt fast combat store ship. ~3-day penalty vs Suez at 25 kts."
  },
  {
    id: "nimitz", coords: [-80, -15], type: "decom", label: "CVN-68 Nimitz",
    detail: "South Pacific — Farewell deployment, circumnavigating S. America for decommissioning in Virginia. Extended 10 months into 2027. Not a combat asset. Escorted by USS Gridley (DDG-101)."
  },
  {
    id: "gw", coords: [139.65, 35.3], type: "inport", label: "CVN-73 GW (in port)",
    detail: "Yokosuka, Japan — IN PORT. Only US carrier covering entire Indo-Pacific. Beijing watching this force posture closely."
  },
  {
    id: "boxer", coords: [144.75, 13.45], type: "arg", label: "LHD-4 Boxer ARG",
    detail: "Near Guam — USS Comstock (LSD-45), USS Portland (LPD-27), 11th MEU. Only deployed amphibious force in Pacific."
  },
  {
    id: "kearsarge", coords: [-74, 36.5], type: "arg", label: "LHD-3 Kearsarge",
    detail: "Atlantic, departed Norfolk — 24th MEU. Could surge toward CENTCOM but weeks from station."
  },
  {
    id: "iwojima", coords: [-81.4, 30.4], type: "inport", label: "Iwo Jima ARG (in port)",
    detail: "Mayport, FL — IN PORT. Available for surge but not yet underway."
  },
  {
    id: "blueridge", coords: [121, 8], type: "logistics", label: "LCC-19 Blue Ridge",
    detail: "Sulu Sea — US 7th Fleet command ship."
  },
  {
    id: "mineclear", coords: [56.5, 26.0], type: "mine", label: "Mine Clearing Ops",
    detail: "Strait of Hormuz — USS Petersen (DDG-121) & USS Michael Murphy (DDG-112) entered strait Saturday to 'set conditions for clearing mines' before blockade announced. Mine risk flagged by CNO Caudle as top blockade challenge."
  },
  {
    id: "inddg", coords: [60, 21.5], type: "inddg", label: "7× Independent DDGs",
    detail: "Arabian Sea / Gulf of Oman — Seven DDGs operating independently of Lincoln CSG or Tripoli ARG. Provide surface combatant density for blockade enforcement: intercept, board, search, divert. 25 commercial vessels turned around since blockade began."
  },
  {
    id: "oilers", coords: [61, 19.5], type: "logistics", label: "Oilers & Stores",
    detail: "USNS Kaiser (oldest T-AO) + USNS John Lewis (newest T-AO) + 3× Lewis & Clark (T-AKE). Without these, Lincoln operations collapse."
  },
  {
    id: "tsp", coords: [55.8, 27.0], type: "trapped", label: "2× TSP Tankers TRAPPED",
    detail: "Strait of Hormuz — Two Tanker Security Program ships trapped, can't exit. Would normally do CONSOL fuel transfers to oilers."
  },
  {
    id: "usmerchant", coords: [51.5, 27.5], type: "trapped", label: "5× US Merchant Ships",
    detail: "PERSIAN GULF — Five US-flagged merchant ships remain inside the Persian Gulf. MSC fleet tug Catawba and Coast Guard vessels were evacuated from Bahrain to Singapore, but these merchant ships were left behind. Sal Mercogliano: 'Could've got the US merchant ships out... I'm a little concerned about them right now.'"
  },
  {
    id: "catawba", coords: [103.8, 1.3], type: "logistics", label: "USNS Catawba (tug)",
    detail: "Singapore — MSC fleet tug evacuated from Bahrain. Critically needed for towing disabled prize vessels like Touska (80,000 tons) but now 3,500+ nm from the blockade line. Coast Guard vessels also evacuated here."
  },
];

const PORTS = [
  { coords: [-95.37, 29.76], label: "Houston/Galveston", detail: "Primary US crude export hub. ~3.9M bbl/day export capacity. 60+ empty VLCCs converging." },
  { coords: [-90.02, 28.88], label: "LOOP", detail: "Louisiana Offshore Oil Port — only US deepwater port for full VLCC loading." },
  { coords: [-97.39, 27.8], label: "Corpus Christi", detail: "Largest US crude export port by volume." },
  { coords: [38.06, 24.08], label: "Yanbu", detail: "Saudi Red Sea terminal. Pipeline: 7M bbl/day. Port loading: 4.5M bbl/day max — 2.5M bottleneck." },
  { coords: [72.42, -7.31], label: "Diego Garcia", detail: "US joint military base. Likely Bush CSG intermediate destination. No ship-to-shore cranes — cannot offload seized container ships like Touska for inspection. Any prize vessel with containers must be towed to a commercial port." },
  { coords: [50.58, 26.22], label: "5th Fleet HQ", detail: "NSA Bahrain — hit by Iranian ballistic missile Mar 1. 3× LCS (MCM) based here." },
  { coords: [-76.33, 36.95], label: "Norfolk", detail: "Homeport of Ford & Bush CSGs." },
  { coords: [139.66, 35.28], label: "Yokosuka", detail: "George Washington homeport (FDNF)." },
];

const CHOKEPOINTS = [
  { coords: [-5.41, 35.97], label: "Gibraltar", detail: "Bush CSG deliberately avoided." },
  { coords: [32.55, 30.0], label: "Suez Canal", detail: "120 mi confined waterway. Ford transited Mar 5. Bush avoiding — carrier on AIS, extremely vulnerable." },
  { coords: [43.33, 12.58], label: "Bab el-Mandeb", detail: "No US carrier transit since Eisenhower Dec 2023. Houthis sank 3 merchant ships. US DDGs came under sustained attack." },
  { coords: [18.47, -34.35], label: "Cape of Good Hope", detail: "Bush CSG and VLCC convoy rounding here. ~3-day penalty at 25 kts." },
];

const BUSH_COMPLETED = [[-76.33,36.95],[-65,32],[-40,20],[-20,5],[0,-10],[12,-22]];
const BUSH_PROJECTED = [[12,-22],[18,-33],[25,-35],[40,-28],[50,-15],[60,0],[72.42,-7.31],[62,10],[62,20]];

const TANKER_ROUTE = [
  [57,25],[60,18],[55,10],[50,0],[45,-15],[40,-25],[25,-35],[18,-33],[10,-30],
  [-5,-15],[-20,5],[-40,15],[-60,20],[-80,25],[-90,28],[-95.37,29.76]
];
const TANKER_NIGERIA = [[40,-25],[20,-5],[5,5],[3,5]];
const TANKER_BRAZIL = [[-40,15],[-45,5],[-35,-5]];
const SAUDI_PIPELINE = [[50,26],[45,25],[38.06,24.08]];

const BLOCKADE_CENTER = [56.25, 26.57];
const BLOCKADE_LINE = [[61.5, 25.2],[60.5, 24.0],[59.5, 23.0],[58.5, 22.5],[57.5, 22.3]];
const TOUSKA_ROUTE = [[103.8, 1.3],[95, 8],[85, 12],[75, 17],[65, 21],[60.5, 23.5]];

const TYPE_COLORS = {
  csg: "#4ac8e8",
  arg: "#6be8b0",
  inport: "#e8c547",
  decom: "#7a8fa8",
  logistics: "#d4a5e8",
  mine: "#ff9f43",
  inddg: "#88b4e8",
  trapped: "#e85454",
  incident: "#ff4444",
  port: "#5bcc72",
  chokepoint: "#ff6b6b",
};

function topojsonFeature(topology, object) {
  const arcs = topology.arcs;
  function decodeArc(arcIdx) {
    const reverse = arcIdx < 0;
    const arc = arcs[reverse ? ~arcIdx : arcIdx];
    let x = 0, y = 0;
    const coords = arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [
        x * topology.transform.scale[0] + topology.transform.translate[0],
        y * topology.transform.scale[1] + topology.transform.translate[1],
      ];
    });
    return reverse ? coords.reverse() : coords;
  }
  function decodeRing(indices) {
    let coords = [];
    indices.forEach((i) => { coords = coords.concat(decodeArc(i)); });
    return coords;
  }
  const features = object.geometries.map((geom) => {
    let coordinates;
    if (geom.type === "Polygon") {
      coordinates = geom.arcs.map(decodeRing);
    } else if (geom.type === "MultiPolygon") {
      coordinates = geom.arcs.map((poly) => poly.map(decodeRing));
    }
    return { type: "Feature", geometry: { type: geom.type, coordinates }, properties: geom.properties || {} };
  });
  return { type: "FeatureCollection", features };
}

const WIDTH = 1400;
const HEIGHT = 700;

export default function NavalMap() {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [worldData, setWorldData] = useState(null);
  const [layers, setLayers] = useState({
    ships: true, routes: true, tankers: true, ports: true, chokepoints: true, blockade: true,
  });

  useEffect(() => {
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((topo) => setWorldData(topojsonFeature(topo, topo.objects.countries)))
      .catch(() => setWorldData(null));
  }, []);

  const projection = useMemo(
    () => d3.geoNaturalEarth1().scale(240).translate([WIDTH / 2, HEIGHT / 2]),
    []
  );
  const path = useMemo(() => d3.geoPath(projection), [projection]);
  const graticule = useMemo(() => d3.geoGraticule10(), []);

  const proj = (lonlat) => projection(lonlat);

  const handleMouseOver = (e, item) => {
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, title: item.label, body: item.detail });
  };
  const handleMouseOut = () => setTooltip(null);
  const toggleLayer = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const makeLine = (points) => {
    if (!points || points.length < 2) return "";
    return points.map((p, i) => {
      const xy = proj(p) || [0, 0];
      return `${i === 0 ? "M" : "L"}${xy[0]},${xy[1]}`;
    }).join(" ");
  };

  return (
    <div style={{ background: "#0a1628", width: "100%", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", background: "linear-gradient(135deg, #0d1f3c, #142644)", borderBottom: "1px solid rgba(100,160,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#e8c547", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>
          US Navy & Global Tanker Positions
        </h1>
        <span style={{ fontSize: 10, color: "#6b8299", fontFamily: "monospace" }}>
          Iran War — April 13–19, 2026 | USNI (Shelbourne), Mercogliano/WGOWS, CENTCOM
        </span>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "auto" }}>
        <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ display: "block", width: "100%", minWidth: 900, height: "auto", background: "#0a1628" }}>
          <rect width={WIDTH} height={HEIGHT} fill="#0e1e33" />
          <path d={path(graticule)} fill="none" stroke="#1a3050" strokeWidth={0.4} opacity={0.5} />
          {worldData && worldData.features.map((f, i) => (
            <path key={i} d={path(f)} fill="#1a2e48" stroke="#243a58" strokeWidth={0.5} />
          ))}

          {layers.blockade && (() => {
            const bc = proj(BLOCKADE_CENTER) || [0, 0];
            const lp = proj([59.5, 22.5]);
            const tp = proj([78, 16]);
            const hz1 = proj([44, 15]);
            const hz2 = proj([44, 13]);
            return (
              <g>
                <circle cx={bc[0]} cy={bc[1]} r={30} fill="rgba(232,84,84,0.12)" stroke="#e85454" strokeWidth={2} strokeDasharray="6,4" />
                <text x={bc[0]} y={bc[1] + 38} textAnchor="middle" fill="#e85454" fontFamily="monospace" fontSize={7} fontWeight={700}>BLOCKADE</text>
                <text x={bc[0]} y={bc[1] + 46} textAnchor="middle" fill="#e85454" fontFamily="monospace" fontSize={5.5} opacity={0.7}>Strait of Hormuz</text>
                <path d={makeLine(BLOCKADE_LINE)} fill="none" stroke="#ff4444" strokeWidth={2} strokeDasharray="10,4" opacity={0.6} />
                {lp && <text x={lp[0]+5} y={lp[1]-8} fill="#ff4444" fontFamily="monospace" fontSize={5.5} fontWeight={600} opacity={0.7}>Blockade Line</text>}
                <path d={makeLine(TOUSKA_ROUTE)} fill="none" stroke="#ff9f43" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
                {tp && (
                  <g>
                    <text x={tp[0]} y={tp[1]-5} fill="#ff9f43" fontFamily="monospace" fontSize={5} opacity={0.6}>M/V Touska route</text>
                    <text x={tp[0]} y={tp[1]+3} fill="#ff9f43" fontFamily="monospace" fontSize={4.5} opacity={0.5}>Shanghai → Bandar Abbas (intercepted)</text>
                  </g>
                )}
                {hz1 && <circle cx={hz1[0]} cy={hz1[1]} r={40} fill="rgba(232,84,84,0.06)" stroke="#e85454" strokeWidth={0.7} strokeDasharray="4,4" />}
                {hz2 && <text x={hz2[0]} y={hz2[1]} textAnchor="middle" fill="#e85454" fontFamily="monospace" fontSize={5} opacity={0.6}>Houthi zone</text>}
              </g>
            );
          })()}

          {layers.routes && (
            <g>
              <path d={makeLine(BUSH_COMPLETED)} fill="none" stroke="#4ac8e8" strokeWidth={2.5} opacity={0.8} />
              <path d={makeLine(BUSH_PROJECTED)} fill="none" stroke="#4ac8e8" strokeWidth={2.5} strokeDasharray="8,5" opacity={0.5} />
              {(() => {
                const mid = proj([-20, 5]);
                return mid ? (
                  <g transform={`translate(${mid[0]-5},${mid[1]-10})`}>
                    <text fill="#4ac8e8" fontFamily="monospace" fontSize={6.5} fontWeight={600} transform="rotate(-30)">Bush CSG Route</text>
                    <text dy={10} fill="#4ac8e8" fontFamily="monospace" fontSize={5} opacity={0.6} transform="rotate(-30)">w/ USNS Arctic • ~25 kts</text>
                  </g>
                ) : null;
              })()}
            </g>
          )}

          {layers.tankers && (
            <g>
              <path d={makeLine(TANKER_ROUTE)} fill="none" stroke="#e8954a" strokeWidth={2.5} strokeDasharray="8,5" opacity={0.7} />
              <path d={makeLine(TANKER_NIGERIA)} fill="none" stroke="#e8954a" strokeWidth={1.2} strokeDasharray="4,4" opacity={0.35} />
              <path d={makeLine(TANKER_BRAZIL)} fill="none" stroke="#e8954a" strokeWidth={1.2} strokeDasharray="4,4" opacity={0.35} />
              <path d={makeLine(SAUDI_PIPELINE)} fill="none" stroke="#5bcc72" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
              {(() => {
                const lbl = proj([10, -30]);
                const lbl2 = proj([-60, 22]);
                return (
                  <>
                    {lbl && <text x={lbl[0]-30} y={lbl[1]} fill="#e8954a" fontFamily="monospace" fontSize={6} fontWeight={600} transform={`rotate(-35,${lbl[0]-30},${lbl[1]})`}>121 Empty Tankers → US Gulf</text>}
                    {lbl && <text x={lbl[0]-25} y={lbl[1]+10} fill="#e8954a" fontFamily="monospace" fontSize={5} opacity={0.6} transform={`rotate(-35,${lbl[0]-25},${lbl[1]+10})`}>60+ VLCCs (2M bbl each)</text>}
                    {lbl2 && (
                      <g>
                        <text x={lbl2[0]} y={lbl2[1]} fill="#e8954a" fontFamily="monospace" fontSize={5.5} fontWeight={600}>Houston→Shanghai: 52.5 days</text>
                        <text x={lbl2[0]} y={lbl2[1]+9} fill="#e8954a" fontFamily="monospace" fontSize={5} opacity={0.6}>vs 22.5 days from Persian Gulf</text>
                      </g>
                    )}
                  </>
                );
              })()}
            </g>
          )}

          {layers.chokepoints && CHOKEPOINTS.map((c) => {
            const p = proj(c.coords);
            if (!p) return null;
            return (
              <g key={c.label} style={{ cursor: "pointer" }} onMouseOver={(e) => handleMouseOver(e, c)} onMouseOut={handleMouseOut}>
                <circle cx={p[0]} cy={p[1]} r={6} fill="none" stroke="#ff6b6b" strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={p[0] + 9} y={p[1] + 3} fill="#ff6b6b" fontFamily="monospace" fontSize={6} opacity={0.85}>{c.label}</text>
              </g>
            );
          })}

          {layers.ports && PORTS.map((p) => {
            const pos = proj(p.coords);
            if (!pos) return null;
            return (
              <g key={p.label} style={{ cursor: "pointer" }} onMouseOver={(e) => handleMouseOver(e, p)} onMouseOut={handleMouseOut}>
                <rect x={pos[0] - 3.5} y={pos[1] - 3.5} width={7} height={7} fill="#5bcc72" transform={`rotate(45,${pos[0]},${pos[1]})`} />
                <text x={pos[0] + 8} y={pos[1] + 3} fill="#5bcc72" fontFamily="monospace" fontSize={5.5} opacity={0.85}>{p.label}</text>
              </g>
            );
          })}

          {layers.ships && SHIPS.map((s) => {
            const p = proj(s.coords);
            if (!p) return null;
            const color = TYPE_COLORS[s.type] || "#aaa";
            const r = s.type === "logistics" ? 5 : (s.type === "mine" || s.type === "inddg" || s.type === "trapped") ? 6 : s.type === "incident" ? 8 : 7;
            const words = s.label.split(" ");
            const line1 = words.slice(0, 3).join(" ");
            const line2 = words.slice(3).join(" ");
            return (
              <g key={s.id} style={{ cursor: "pointer" }} onMouseOver={(e) => handleMouseOver(e, s)} onMouseOut={handleMouseOut}>
                {s.type === "incident" && <circle cx={p[0]} cy={p[1]} r={r + 8} fill={color} opacity={0.08} />}
                <circle cx={p[0]} cy={p[1]} r={r + 4} fill={color} opacity={s.type === "incident" ? 0.2 : 0.12} />
                {s.type === "incident" ? (
                  <>
                    <polygon points={`${p[0]},${p[1]-r} ${p[0]+r*0.87},${p[1]+r*0.5} ${p[0]-r*0.87},${p[1]+r*0.5}`} fill={color} stroke="#0a1628" strokeWidth={1.5} />
                    <text x={p[0]} y={p[1]+3} textAnchor="middle" fill="#0a1628" fontFamily="monospace" fontSize={6} fontWeight={700}>!</text>
                  </>
                ) : (
                  <circle cx={p[0]} cy={p[1]} r={r} fill={color} stroke="#0a1628" strokeWidth={1.5} />
                )}
                {s.type === "inport" && <circle cx={p[0]} cy={p[1]} r={r + 3} fill="none" stroke="#e8c547" strokeWidth={1} strokeDasharray="3,2" />}
                <text x={p[0] + r + 5} y={p[1] - 2} fill={color} fontFamily="monospace" fontSize={s.type === "incident" ? 6.5 : 6} fontWeight={700}>{line1}</text>
                <text x={p[0] + r + 5} y={p[1] + 7} fill={color} fontFamily="monospace" fontSize={5} opacity={0.6}>{line2}</text>
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div style={{
            position: "absolute",
            left: Math.min(tooltip.x + 15, 1100),
            top: tooltip.y - 10,
            background: "rgba(10,22,40,0.96)",
            border: "1px solid rgba(232,197,71,0.4)",
            borderRadius: 4,
            padding: "10px 14px",
            maxWidth: 300,
            pointerEvents: "none",
            zIndex: 100,
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ color: "#e8c547", fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>{tooltip.title}</div>
            <div style={{ color: "#c8d6e5", fontSize: 11, lineHeight: 1.55 }}>{tooltip.body}</div>
          </div>
        )}

        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(10,22,40,0.92)", border: "1px solid rgba(100,160,255,0.2)", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace", fontSize: 10, zIndex: 50 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#e8c547", marginBottom: 6, fontWeight: 700 }}>Oil Supply Disruption</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Hormuz normal: 20M bbl/day</div>
          <div style={{ color: "#e85454", fontWeight: 600, marginBottom: 2 }}>Current: 1.5M bbl/day (−92%)</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Net shortfall: 11.1M bbl/day</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Global drawdown: 218M bbl</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>US export: ~3.9M bbl/day</div>
          <div style={{ color: "#e8954a", fontWeight: 600 }}>60+ VLCCs queuing for US Gulf</div>
          <div style={{ color: "#e85454", fontWeight: 600, marginTop: 4, fontSize: 9, borderTop: "1px solid rgba(232,84,84,0.3)", paddingTop: 4 }}>25 vessels turned around</div>
          <div style={{ color: "#ff4444", fontWeight: 600 }}>M/V Touska seized Apr 19</div>
          <div style={{ color: "#ff4444" }}>3× IRGC attacks on shipping Apr 18</div>
        </div>

        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(10,22,40,0.92)", border: "1px solid rgba(100,160,255,0.2)", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace", fontSize: 10, zIndex: 50 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#e8c547", marginBottom: 6, fontWeight: 700 }}>Fleet Status</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Total Battle Force: 291</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Deployed: 105 (37 FDNF + 68 Rot)</div>
          <div style={{ color: "#e8954a", fontWeight: 600, marginBottom: 2 }}>CENTCOM: 1 CSG + 1 ARG + 7 ind. DDGs</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>+ 2 DDGs mine-clearing in strait</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Eastern Med: 1 CSG (Ford)</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>Transit → CENTCOM: 1 CSG (Bush)</div>
          <div style={{ color: "#8fa8c8", marginBottom: 2 }}>INDOPACOM: 1 CV in port + 1 ARG</div>
          <div style={{ color: "#8fa8c8" }}>Logistics: 2 T-AO, 3 T-AKE, 1 T-AOE</div>
          <div style={{ color: "#e85454", marginTop: 4, fontSize: 9, borderTop: "1px solid rgba(232,84,84,0.3)", paddingTop: 4 }}>5 US merchant ships in Persian Gulf</div>
          <div style={{ color: "#7a8fa8" }}>Catawba tug evacuated → Singapore</div>
        </div>

        <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(10,22,40,0.92)", border: "1px solid rgba(100,160,255,0.2)", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace", fontSize: 10, zIndex: 50 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#e8c547", marginBottom: 6, fontWeight: 700 }}>Layers</div>
          {[
            ["ships", "Navy ships"],
            ["routes", "Ship routes"],
            ["tankers", "Tanker routes"],
            ["ports", "Ports"],
            ["chokepoints", "Chokepoints"],
            ["blockade", "Blockade zones"],
          ].map(([k, lbl]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8fa8c8", cursor: "pointer", marginBottom: 3 }}>
              <input type="checkbox" checked={layers[k]} onChange={() => toggleLayer(k)} style={{ accentColor: "#e8c547" }} />
              {lbl}
            </label>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(10,22,40,0.92)", border: "1px solid rgba(100,160,255,0.2)", borderRadius: 6, padding: "10px 14px", fontFamily: "monospace", fontSize: 10, zIndex: 50 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#e8c547", marginBottom: 6, fontWeight: 700 }}>Legend</div>
          {[
            ["#4ac8e8", "●", "Carrier Strike Group"],
            ["#6be8b0", "●", "Amphibious Ready Group"],
            ["#e8c547", "●", "In port"],
            ["#7a8fa8", "●", "Non-combat / Decom"],
            ["#d4a5e8", "●", "Logistics"],
            ["#ff9f43", "●", "Mine clearing ops"],
            ["#88b4e8", "●", "Independent DDGs"],
            ["#ff4444", "⚠", "Incident / Attack"],
            ["#5bcc72", "◆", "Key port"],
            ["#ff6b6b", "○", "Chokepoint"],
            ["#4ac8e8", "—", "Bush CSG route"],
            ["#e8954a", "—", "Tanker route"],
            ["#e85454", "○", "Blockade zone"],
          ].map(([color, sym, lbl], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "#8fa8c8", marginBottom: 3 }}>
              <span style={{ color, fontWeight: 700, fontSize: 11, width: 14, textAlign: "center" }}>{sym}</span>
              {lbl}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
