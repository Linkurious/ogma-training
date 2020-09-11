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

// Helper function to get the type of a Node
function getNodeType(node) {
  return node.getData("neo4jLabels")[0];
}

// Helper function to check if a node should pulse
// Nodes pulses if the total demand is higher than their stock
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

// Define buckets of importance for nodes
const edgeSlices = [
  [280, "#444", 3.5],
  [150, "#777", 2],
  [15, "#AAA", 1.5],
  [0, "#DDD", 0.5],
];

const nodeSlices = [
  [/^Supplier.*/, "#6FC1A7", "\uEA04"],
  [/RawSupplier/, "#3DCB8D", "\uEA03"],
  [/FrameSupplier/, "#6FC1A7", "\uEA05"],
  [/WheelSupplier/, "#6FC1A7", "\uEA08"],
  [/Wholesaler/, "#E77152", "\uEA09"],
  [/Retailer/, "#9AD0D0", "\uEA06"],
  [/Product/, "#76378A", "\uEA02"],
];

ogma.styles.addRule({
  // Edges style:
  edgeAttributes: function (edge) {
    const quantity = edge.getData("neo4jProperties.quantity");
    const [, color, width] = quantity
      ? edgeSlices.find(([threshold]) => quantity > threshold)
      : edgeSlices[0];
    return {
      shape: {
        head: "arrow",
      },
      color,
      width,
    };
  },
  //   // Node style:
  nodeAttributes: function (node) {
    const type = getNodeType(node);
    const [, color, icon] =
      nodeSlices.find(([sliceType]) => type.match(sliceType)) || nodeSlices[0];
    return {
      icon: {
        font: "icon-font",
        color: "#000",
        content: icon,
      },
      // define colors depending on the type of the node
      color,
      // nodes size depend on the quantity of Product that is exanged through them
      radius:
        node
          .getAdjacentEdges()
          .reduce((acc, e) => acc + e.getData("neo4jProperties.quantity"), 0) /
          300 +
        5,
      // Make nodes that have a higher demand than their stock pulsating
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

function groupEdges(edges) {
  return {
    data: {
      neo4jProperties: {
        quantity: edges.reduce(
          (total, edge) => total + edge.getData("neo4jProperties.quantity"),
          0
        ),
      },
    },
  };
}

const edgeGrouping = ogma.transformations.addEdgeGrouping({
  selector: function (edge) {
    return edge.getData("neo4jType") === "DELIVER";
  },
  enabled: false,
  generator: (edges) => groupEdges(edges),
});

document.getElementById("edge-grouping").addEventListener("click", () => {
  edgeGrouping.toggle().then(() => ogma.layouts.force());
});

const nodeGrouping = ogma.transformations.addNodeGrouping({
  groupIdFunction: function (node) {
    return node.getData("neo4jLabels")[0];
  },
  selector: function (node) {
    return node.getData("neo4jLabels")[0].match(/^Supplier.*/);
  },
  enabled: false,
  edgeGenerator: (edges) => groupEdges(edges),
  nodeGenerator(nodes, groupId) {
    return {
      data: {
        neo4jLabels:
          groupId === "SupplierA" ? ["FrameSupplier"] : ["WheelSupplier"],
        neo4jProperties: {
          quantity: nodes.reduce(
            (total, node) => total + node.getData("neo4jProperties.quantity"),
            0
          ),
        },
      },
    };
  },
});

document.getElementById("node-grouping").addEventListener("click", () => {
  nodeGrouping.toggle().then(() => ogma.layouts.force());
});
