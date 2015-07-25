var React = require("react");
var $ = require("jquery");
localStorage["currentKey"] = 0;
if(localStorage["lastMessages"]){
	var locallength = JSON.parse(localStorage["lastMessages"]).last;
	localStorage["currentKey"] = locallength.length;
}
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

		if(event.shiftKey && event.keyCode == 40){
			event.preventDefault();

			localStorage["currentKey"]++;

			var storedMessages = JSON.parse(localStorage["lastMessages"]).last;

			$(React.findDOMNode(this.refs.message)).val(storedMessages[localStorage["currentKey"]]);	
		}
		if(event.shiftKey && event.keyCode == 38){
			event.preventDefault();

			localStorage["currentKey"]--;

			var storedMessages = JSON.parse(localStorage["lastMessages"]).last;

			$(React.findDOMNode(this.refs.message)).val(storedMessages[localStorage["currentKey"]]);
		}
		if(message.length != ""){
       if(event.keyCode == 13 && !event.shiftKey){
       	if(message.split(" ")[0] == '/color'){
					localStorage.setItem('userColor', message.split(" ")[1]);
					console.log(message)
				}
       		if(localStorage["lastMessages"]){
	       		var storedMessages = JSON.parse(localStorage["lastMessages"]).last;
	       		length = storedMessages.length;
	       		if(length <= 10){
	       			storedMessages[length] = message;
	       		}else{
	       			storedMessages.shift();
	       			storedMessages[10] = message;
	       		}

						localStorage["lastMessages"] = JSON.stringify({"last" : storedMessages});

					} else {
						localStorage["lastMessages"] = JSON.stringify({"last" : [message]});
					}

					if(localStorage["lastMessages"]){
						var locallength = JSON.parse(localStorage["lastMessages"]).last;
						localStorage["currentKey"] = locallength.length;
					}

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
							<div className="large-2 small-2 columns sideMessage"></div>
							<textarea rows="1" ref="message" className="large-9 medium-12 small-12 columns userMessage chat" onKeyDown={this.addMessage}/>
						</div>
					</div>
				</div>
			</div>
		)
	}
});


module.exports = ChatInput;