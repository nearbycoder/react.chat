var React = require("react");
var ChatInput = React.createClass({
	addMessage: function(event){
         if(event.keyCode == 13){
            var message = React.findDOMNode(this.refs.message).value;
            this.props.onKeyDown(message);
            React.findDOMNode(this.refs.message).value = "";
         }
     },
	render: function(){
		
		return(
				<div className="chatInput">
					<div className="row">
						<div className="large-6 large-offset-3 columns">
						<input type="text" ref="message" onKeyDown={this.addMessage}/>
						</div>
					</div>
	      </div>
		)
	}
});


module.exports = ChatInput;