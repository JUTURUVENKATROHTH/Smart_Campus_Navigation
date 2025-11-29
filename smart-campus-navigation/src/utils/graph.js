import { haversine, turnDirection } from "./geo.js";
import { PLACES } from "../data/places.js";
import { PATHS } from "../data/paths.js";
import { GRAPH } from "../data/adjacency_list.js";

function byId(id) {
  return PLACES.find((p) => p.id === id);
}

export function buildGraph() {
  const graph = new Map();
  for (const [a, b] of PATHS) {
    const A = byId(a);
    const B = byId(b);
    if (!A || !B) continue;
    const w = haversine(A.lat, A.lng, B.lat, B.lng);
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push({ to: b, weight: w });
    graph.get(b).push({ to: a, weight: w });
  }
  return graph;
}

// export function dijkstra(graph, startId, endId) {
//   const dist = new Map();
//   const prev = new Map();
//   const visited = new Set();
//   const nodes = Array.from(graph.keys());
//   for (const id of nodes) dist.set(id, Infinity);
//   dist.set(startId, 0);

//   while (visited.size < nodes.length) {
//     let u = null, best = Infinity;
//     for (const id of nodes) {
//       if (!visited.has(id) && dist.get(id) < best) {
//         best = dist.get(id);
//         u = id;
//       }
//     }
//     if (u === null) break;
//     visited.add(u);
//     if (u === endId) break;
//     for (const { to, weight } of graph.get(u) || []) {
//       const alt = dist.get(u) + weight;
//       if (alt < dist.get(to)) {
//         dist.set(to, alt);
//         prev.set(to, u);
//       }
//     }
//   }

//   const path = [];
//   let cur = endId;
//   while (cur) {
//     path.unshift(cur);
//     if (cur === startId) break;
//     cur = prev.get(cur);
//   }
//   return { path, dist: dist.get(endId) };
// }

export function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let current = null;
    let min = Infinity;
    for (const node in dist) {
      if (!visited.has(node) && dist[node] < min) {
        min = dist[node];
        current = node;
      }
    }
    if (current === null || current === end) break;

    visited.add(current);

    for (const { to, weight } of graph[current]) {
      const newDist = dist[current] + weight;
      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = current;
      }
    }
  }

  const path = [];
  let node = end;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }

  return { path, dist: dist[end] };
}


export function generateRouteSteps(pathIds) {
  if (!pathIds || pathIds.length < 2) return [];

  const steps = [];
  steps.push(`Start at ${byId(pathIds[0]).name}`);

  let straightDistance = 0;
  let firstStraight = true;

  for (let i = 0; i < pathIds.length - 2; i++) {
    const prev = byId(pathIds[i]);
    const curr = byId(pathIds[i + 1]);
    const next = byId(pathIds[i + 2]);
    const dir = turnDirection(prev, curr, next);
    const distance = haversine(curr.lat, curr.lng, next.lat, next.lng);

    const formatDist = (d) =>
      d < 1000 ? `${Math.round(d)} meters` : `${(d / 1000).toFixed(2)} km`;

    const nextNamed = pathIds
      .slice(i + 2)
      .map((id) => byId(id))
      .find((p) => p.name && p.name.trim() !== "");

    // combine all small straight/continue movements
    if (
      dir.includes("straight") ||
      dir.includes("continue") ||
      dir.includes("same")
    ) {
      straightDistance += distance;
      continue;
    }

    // if we accumulated straight distance before a turn — summarize it once
    if (straightDistance > 0) {
      const textDist = formatDist(straightDistance);
      if (firstStraight) {
        steps.push(`Head straight for ${textDist}`);
        firstStraight = false;
      } else {
        steps.push(`Continue straight for ${textDist}`);
      }
      straightDistance = 0;
    }

    // handle turning steps with destination context
    const dest = nextNamed ? nextNamed.name : "the next point";
    if (dir.includes("right")) {
      steps.push(`In ${formatDist(distance)}, turn right toward ${dest}`);
    } else if (dir.includes("left")) {
      steps.push(`In ${formatDist(distance)}, turn left toward ${dest}`);
    } else if (dir.includes("U-turn")) {
      steps.push(`Make a U-turn toward ${dest}`);
    } else {
      steps.push(`In ${formatDist(distance)}, continue toward ${dest}`);
    }
  }

  // summarize any remaining straight distance
  if (straightDistance > 0) {
    const textDist =
      straightDistance < 1000
        ? `${Math.round(straightDistance)} meters`
        : `${(straightDistance / 1000).toFixed(2)} km`;
    steps.push(`Continue straight for ${textDist}`);
  }

  steps.push(`You have arrived at ${byId(pathIds[pathIds.length - 1]).name}.`);
  return steps;
}
