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

// load the graph
api.getGraph()
  .then(neo4jResponse => ogma.parse.neo4j(neo4jResponse))
  .then((rawGraph) => ogma.setGraph(rawGraph))
  // setup the camera so we can see the entire graph
  .then(() => ogma.view.locateGraph())
  .then(() => {
    // show some information about the graph
    const nodes = ogma.getNodes();
    const edges = ogma.getEdges();
    document.getElementById('controls').innerHTML =
      `Loaded <br>${nodes.size} nodes, ${edges.size} edges`;
  });
