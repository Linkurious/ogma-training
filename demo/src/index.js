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

// Define buckets of importance for nodes
const edgeSlices = [
  [280, "#444", 3.5],
  [150, "#777", 2],
  [15, "#AAA", 1.5],
  [0, "#DDD", 0.5],
];

/**
 * Let's style the nodes,
 * We will set their colors and icons depending on their type.
 * and their radius will grow accordingly to the total exchanges passing through them
 */
const nodeSlices = [
  [/^Supplier.*/, "#6FC1A7", "\uEA04"],
  [/RawSupplier|AllRawsuppliers/, "#3DCB8D", "\uEA03"],
  [/FrameSupplier/, "#6FC1A7", "\uEA05"],
  [/WheelSupplier/, "#6FC1A7", "\uEA08"],
  [/Wholesaler|AllWholesalers/, "#E77152", "\uEA09"],
  [/Retailer|Allretailers/, "#9AD0D0", "\uEA06"],
  [/Product/, "#76378A", "\uEA02"],
];

ogma.styles.addRule({
  // Edges style:
  edgeAttributes: function (edge) {
    const quantity = edge.getData("neo4jProperties.quantity");
    //   if (!quantity) return slices[0][1];
    const [, color, width] = quantity
      ? edgeSlices.find(([threshold]) => quantity > threshold)
      : slices[0];
    return {
      shape: {
        head: "arrow",
      },
      color,
      width,
    };
  },
  // Node style:
  nodeAttributes: function (node) {
    const type = node.getData("neo4jLabels")[0];
    const [, color, icon] =
      nodeSlices.find(([sliceType]) => type.match(sliceType)) || nodeSlices[0];
    return {
      icon: {
        font: "icon-font",
        color: "#000",
        content: icon,
      },
      color,
      // nodes size depend on the quantity of product that is exanged through them
      radius:
        node
          .getAdjacentEdges()
          .reduce((acc, e) => acc + e.getData("neo4jProperties.quantity"), 0) /
          300 +
        5,
      color,
    };
  },
});
