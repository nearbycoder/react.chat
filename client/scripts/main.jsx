var io = require("socket.io-client");
var socket = io('http://127.0.0.1:6060');
var foundation = require("../node_modules/foundation/scss/foundation.scss");
var styles = require("../styles/main.scss");
var React = require("react");
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
		socket.on('connect', function(){});
	},
	getInitialState: function(){
		return null;
	},
	render: function(){
		return(
			<div>
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
