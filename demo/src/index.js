import * as neo4j from "neo4j-driver";
import Ogma from "ogma";

const host = "neo4j+s://db-xk5qmxsgakadwhvrtomo.graphenedb.com:24786";
const ogma = new Ogma({
  container: "app",
});
window.ogma = ogma;

// Create a driver to connect to the Neo4j database
const driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "spongebob"));
const session = driver.session({
  database: "neo4j",
  defaultAccessMode: neo4j.session.READ,
});

// Query the graph to the server and load it to ogma
const query = "MATCH (a)-[r]-() RETURN a, r";
session
  .run(query)
  .then((response) => {
    session.close();
    return ogma.parse.neo4j(response);
  })
  .then((rawGraph) => ogma.setGraph(rawGraph))
  // apply the force layout to the graph (places the nodes so it is readable )
  .then(() => ogma.layouts.force())
  .then(() => {
    // settup the camera so we can see the entire graph
    ogma.view.locateGraph();
  })
  .catch((error) => {
    console.error(error);
  });

/**
 * Now we want to style the graph, make it look pretty and readable.
 * Let's start by edges, we want to make them bigger as the volume
 * of exchange they represent grows.
 */

// Define buckets of importance for edges
const edgeSlices = [
  // [volume, color, size]
  [280, "#444", 3.5],
  [150, "#777", 2],
  [15, "#AAA", 1.5],
  [0, "#DDD", 0.5],
];

// Define edge rule:
ogma.styles.addRule({
  edgeAttributes: function (edge) {
    //
    const quantity = edge.getData("neo4jProperties.quantity");
    const [, color, width] = edgeSlices.find(
      ([threshold]) => quantity > threshold
    );
    return {
      shape: {
        head: "arrow",
      },
      color,
      width,
    };
  },
});
