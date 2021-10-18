import * as neo4j from "neo4j-driver";
import Ogma from "ogma";
import './styles.css';

import { HOST, DB_NAME, PASSWORD } from '../../credentials.json';

const ogma = new Ogma({ container: "app" });

// little neo4j access wrapper. You would want to replace that with
// a backend API for obvious reasons
class API {

  constructor(uri, db, pass) {
    this._db = db;
    this._pass = pass;
    this._uri = uri;

    // Create a driver to connect to the Neo4j database
    const driver = neo4j.driver(this._uri, neo4j.auth.basic(db, pass));
    this._session = driver.session({
      database: db,
      defaultAccessMode: neo4j.session.READ,
    });
  }

  // Query the graph to the server and load it to ogma
  getGraph() {
    const query = "MATCH (a)-[r]-() RETURN a, r";
    return this._session
      .run(query)
      .then(response => ogma.parse.neo4j(response));
  }

  // override to serve a static response copy instead
  getGraph() {
    return fetch('dist/graph.json')
      .then(r => r.json());
  }
}

// instance of the API client
const api = new API(HOST, DB_NAME, PASSWORD);

api.getGraph()
  .then(neo4jResponse => ogma.parse.neo4j(neo4jResponse))
  .then((rawGraph) => ogma.setGraph(rawGraph))
  // apply the force layout to the graph (places the nodes so it is readable )
  .then(() => ogma.layouts.force())
  // setup the camera so we can see the entire graph
  .then(() => ogma.view.locateGraph());

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
// some values repeat themselves for different types
const supplierStyle = { color: "#6FC1A7", icon: "\uEA04" };
const rawSupplierStyle = { color: "#3DCB8D", icon: "\uEA03" };
const wholeSalerStyle = { color: "#E77152", icon: "\uEA09" };
const retailerStyle = { color: "#9AD0D0", icon: "\uEA06" };

const nodeStyles = {
  'SupplierA': supplierStyle,
  'SupplierB': supplierStyle,

  'RawSupplierA': rawSupplierStyle,
  'RawSupplierB': rawSupplierStyle,
  'AllRawSupliers': rawSupplierStyle,

  'Retailer': retailerStyle,
  'AllRetailers': retailerStyle,

  'Wholesaler': wholeSalerStyle,
  'AllWholesalers': wholeSalerStyle,

  'FrameSupplier': { color: "#6FC1A7", icon: "\uEA05" },
  'WheelSupplier': { color: "#6FC1A7", icon: "\uEA08" },

  'Product': { color: "#76378A", icon: "\uEA02" }
};

// edge color and width buckets
const edgeBuckets = ogma.rules.slices({
  field: "neo4jProperties.quantity",
  values: [
    { color: "#DDD", width: 0.5 },
    { color: "#AAA", width: 1.5 },
    { color: "#777", width: 2 },
    { color: "#444", width: 3.5 }
  ],
  stops: [15, 150, 280]
})

ogma.styles.addRule({
  // Edges style:
  edgeAttributes: (edge) => {
    const quantity = edge.getData("neo4jProperties.quantity");
    const { color, width } = edgeBuckets(edge);
    return {
      shape: {
        head: "arrow",
      },
      color,
      width
    };
  },
  // Node style:
  nodeAttributes: (node) => {
    const type = getNodeType(node);
    const { color, icon } = nodeStyles[type];

    return {
      icon: {
        font: "icon-font",
        color: "#000000",
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
