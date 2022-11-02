import RevealNotes from 'reveal.js/plugin/notes/notes';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight';
import 'reveal.js/dist/reset.css';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';
import 'reveal.js/plugin/highlight/monokai.css';

Reveal.initialize({
  plugins: [ RevealHighlight, RevealNotes ],
  hash: true,
  slideNumber: true,
  width: "100%",
  height: "100%",
});