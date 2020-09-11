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

const query = "MATCH (a)-[r]-() RETURN a, r";
session
  .run(query)
  .then((response) => ogma.parse.neo4j(response))
  .then((rawGraph) => ogma.addGraph(rawGraph, { locate: {} }))
  .then(() => ogma.layouts.force())
  .then(() => {
    ogma.view.locateGraph();
    session.close();
  })
  .catch((error) => {
    console.error(error);
  });

function getNodeType(node) {
  const name = node.getData("neo4jProperties.name");
  if (name.includes("RawSupplier")) return "rawsupplier";
  if (name.includes("Supplier")) return "supplier";
  if (name.includes("Wholesaler")) return "wholesaler";
  if (name.includes("Product")) return "product";
  if (name.includes("Retailer")) return "retailer";
}

function shouldPulse(node) {
  const totalDemand = node
    .getAdjacentEdges()
    .filter((edge) => edge.getSource() === node)
    .reduce(
      (total, edge) => total + edge.getData("neo4jProperties.quantity"),
      0
    );

  return node.getData("neo4jProperties.stock") - totalDemand < 100;
}

const slices = [
  [280, "#444", 3.5],
  [150, "#777", 2],
  [15, "#AAA", 1.5],
  [0, "#DDD", 0.5],
];
ogma.styles.addRule({
  edgeAttributes: {
    shape: {
      head: "arrow",
    },
    color: function (e) {
      const quantity = e.getData("neo4jProperties.quantity");
      if (!quantity) return slices[0][1];
      return slices.find(([threshold]) => quantity > threshold)[1];
    },
    width: function (e) {
      const quantity = e.getData("neo4jProperties.quantity");
      if (!quantity) return slices[0][2];
      return slices.find(([threshold]) => quantity > threshold)[2];
    },
  },
  nodeAttributes: function (node) {
    const type = getNodeType(node);
    return {
      color:
        type === "supplier"
          ? "#6FC1A7"
          : type === "wholesaler"
          ? "#E77152"
          : type === "rawsupplier"
          ? "#3DCB8D"
          : type === "product"
          ? "#76378A"
          : // retailer
            "#9AD0D0",

      radius:
        node
          .getAdjacentEdges()
          .reduce((acc, e) => acc + e.getData("neo4jProperties.quantity"), 0) /
          300 +
        5,
      pulse: {
        enabled: shouldPulse(node),
        endRatio: 1.5,
        width: 4,
        interval: 600,
        startRatio: 1.0,
      },
    };
  },
});
