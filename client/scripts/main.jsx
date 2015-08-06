var foundation = require("../node_modules/foundation/scss/foundation.scss");
var styles = require("../styles/main.scss");
var React = require("react");
var Favicon = require("react-favicon");
var url1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC/UlEQVRYR71XXVoaQRCsJj+aT5aQEzieQHOC4AlCTgB5lH0InEA9gfgAPgZPEDyBeALNCZzcAN3NFzF+VL4ZWILLzrIbMTzuznZXd1fVNIJn+qmTXwp82ATlRvvFK1caeY78qhPWRfg1ik2grRteKynXygGYyoUP1/FkpLxP6sQzAAgqQpwvAsCh9r2D+HMnAHXEMtbCbYyK33VLhllHtZIOmBkC4yMRKZMcAoWW9ou9zCC6tz2B1GYcII617zUzccBZgbzc0ntv9DIQlv3j35eAXEDYAws6lwpU97YqkG8LMwQ/6UapvxSArR5VjjyVZXQLHFCdcEeEl1lZPH9OnUwISCYTLtMIzCEVm6F5RrKn/dLntA6obnAlZPnaL6llnYreu1VwElQwRgVC42JmLLVlIEz3TOC0mWeWYfzgRBk2eM8mEu6DrEyUgitAetovHmetfGkHXIFcJLVjAga64e3mAZHLCSOJmapdSfIQ0MTIB6ATHIhgP61CY1zaL71LOmNUgjFrsAXw1Mg6L4C+CD4uazFHxQmA9btyZF6RROe/JaSVD0CCPJPAXDc8iSc0nYmPjqC2AOxs8VDDWIa43ziddzBDOohs6z3vUHXDpoBHqR0gfxgfsJfZerhjpWxnzTpENh9/yxuJs9pePlJogmPzYdWiJn+w8KqCu/Uh1sKBANtOEjosO76kTMwNx2LdKymgSQrpT/U9W6msVWPcX6zGBky88yOwypKYTUDemuS4Lx7IVjdgvBoCF7rh2dYlstnuCj/rxoggKOOvETl3P1csUZ1ggdmGnbpRbC9j+yrey3R7NXq0cyVxpn2vmie4KQIig38BPZOh9ffCi2GWpSMOTnWDgXmWNjbnCPJU6uREJ2gDrLkcMC1HLiNyAphuUYTUMdo4y7IJRbGeDMAazuvwXAR2F5gusbtZd4KnA0jcnrITeQUAAuOMH+LjMfdBFn5lOpQWSHWCtgi+PLrlckj56QAm/6Dm7gfekIXKf+PAzOfNskGWMfIGeVTwB50jk2DkMyM0AAAAAElFTkSuQmCC";
var url2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC10lEQVRYR71WTVoaQRB9r/MlusvkBBm4gOYEwROELAR3kBMIJxBPoJ4g4y6Di+AJxBNILjCMN8BdMF+68nUPIDA/9ER0llBd/erVq9dFvNAnR76Pv/gI4IFX8SjvGr7E/XLot6HU90VuwTn7UTfrrq0DsJWLGqcu0/pTFhMvAaAGUTcpAIJT9qPe+u+5AKTue3iLPfzBLw7iiWurtsKA7SF5BtKDyAQiXV7FgTOIRiUA2VqKv2AYdZw0kFsBdYU/4ngTCHte8w7ELUQCCOJSUyANvw6qn+ke6q/sx4ONAEz1YB2P2ndpXUoDcujvQ6k7VxUvx8mRnwgwR3BOLTBBku6h+TlgGH0rYkCaFWM4HsOxv4mp+f/5U2Cq0aoG6JGlNBFVIQjLHoCinjuP4XqgnYwkeWAvojoBpDablBEoAcP4wrXyjQzkJcoVqT0gQ4bjgzIgSjnh04jRy72khAAto2XQSqPaA3FSeEZkwv74Q1bMbEpaEHiAvjRjXQ5AszIA+GUj6KlOAOzCm5vXYkRXD3fLAcgezxQehhFTFxpLN9a+8klsASS9VS1QTzDF5bKDWdFB7bEfnUqzavz8rJgBuTc+YB+zXewno2yaLW2AZkF5+gQPTKnaIIV0QFWDiJl/D5B7UGr4jQl2OAS4ly/CbMtOLSlJggsm7pWVUO4BDqB1sGwsiVXTaGG1Gktl9ps/B2tFDHRAvDeXY6p7lGZVUtWI3LI/TqjL+Cy9O6ptjcgomhytA90o1FmAYSBL2V2G0blrkufEGbX6EEvprK9yzXBcL5N0VsTwf0AvxtD29g0mLkvHOjhpVIZW6AVtyyuolA/kaqJZPYdIK88Bi9jcDoD5FiW6jUdcu2xCc1DPBmAn4h1vQNpdYLbEHrjuBM8HkGnP7kLeBoAhyM/rfTbvgcskOQUVJRIjQOB4NeY1GbCuuPQ+CB4guvZqGlj4vF1i4eERwzJT8A+PKmZc+uPZywAAAABJRU5ErkJggg=="
if(module.hot) {
  // accept itself
  module.hot.accept();
  
  // dispose handler
  module.hot.dispose(function() {
      var styles = require("../styles/main.scss");
  });
}

//Load React Templates
var Title = require("./templates/title.jsx");
var ChatBox = require("./components/chatbox.jsx");

var App = React.createClass({
	componentWillMount: function() {
	},
	getInitialState: function(){
		return null;
	},
	render: function(){
		return(
			<div>
			<Favicon url={[url1, url2]}/>
			<Title />
			<ChatBox />
			</div>
		)
	}
});

React.render(
  <App />,
  document.getElementById('main')
);
