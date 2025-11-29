// generateGraph.js
import { PLACES } from "../data/places.js";
import { PATHS } from "../data/paths.js";
import { haversine } from "../utils/geo.js";
import fs from "fs";

function byId(id) {
  return PLACES.find((p) => p.id === id);
}

const graph = {};

for (const [a, b] of PATHS) {
  const A = byId(a);
  const B = byId(b);
  if (!A || !B) continue;

  const dist = haversine(A.lat, A.lng, B.lat, B.lng);

  if (!graph[a]) graph[a] = [];
  if (!graph[b]) graph[b] = [];

  graph[a].push({ to: b, weight: Number(dist.toFixed(2)) });
  graph[b].push({ to: a, weight: Number(dist.toFixed(2)) });
}

fs.writeFileSync(
  "../data/adjacency_list.js",
  "export const GRAPH = " + JSON.stringify(graph, null, 2) + ";\n"
);
console.log(" graph.js generated successfully!");
