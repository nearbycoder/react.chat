var React = require("react");
var $ = require("jquery");
$(function() {
$('#userChat').on( 'change keyup keydown paste cut', 'textarea', function (){
    $(this).height(0).height(this.scrollHeight - 20);
    $(".chatBox").css('margin-bottom', this.scrollHeight);
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    	$('html, body').scrollTop( $(document).height());
    }
}).find( 'textarea' ).change();
});

var ChatInput = React.createClass({
	addMessage: function(event){
		var message = React.findDOMNode(this.refs.message).value;
		if(event.keyCode == 13 && !event.shiftKey){
			event.preventDefault();
		}
		if(message.length != ""){
       if(event.keyCode == 13 && !event.shiftKey){
          this.props.onKeyDown(message);
          $(React.findDOMNode(this.refs.message)).val("").focus(); 
          event.preventDefault();
       }
    } 
  },
	render: function(){
		
		return(
			<div className="chatInput">
				<div className="row">
					<div className="large-12 columns mainContainer">
						<div id="userChat" className="small-12 large-12 columns userChat">
							<div className="large-2 columns sideMessage"></div>
							<textarea rows="1" ref="message" className="large-9 small-12 columns userMessage chat" onKeyDown={this.addMessage}/>
						</div>
					</div>
				</div>
			</div>
		)
	}
});


module.exports = ChatInput;