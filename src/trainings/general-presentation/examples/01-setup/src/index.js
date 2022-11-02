import Ogma from 'ogma';
import './styles.css';

console.log('Welcome to visualisation with Ogma');

// create a container and add CSS to it
const container = document.createElement('div');
container.id = 'vis';
document.body.appendChild(container);

// initialize Ogma
const ogma = new Ogma({ container });
// add some nodes and edges
ogma.addNode({ id: 0, attributes: { x: -125, y: -75, radius: 20 } });
ogma.addNode({ id: 1, attributes: { x: 125, y: -75, radius: 20 } });
ogma.addEdge({ source: 0, target: 1 });
