import React, {Component} from 'react';
import TrashIcon from "../assets/trash.svg";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.css';


class Messages extends Component {

    constructor(){
        super();
        this.deleteMessage = this.deleteMessage.bind(this);
    }
    msgContainer = React.createRef();

    scrollToBottom(){
        this.msgContainer.current.scrollTo(0, this.msgContainer.current.scrollHeight);
    }

    componentDidMount(){
        console.log(this.msgArr);
        console.log("this mounted")
    }

    deleteMessage(e){
        this.props.deleteMsg(e.target.dataset.id);
        // console.log(e.target.dataset);
    }
    
    render() { 
        return ( 
     <div className="chat--messagesContainer" ref={this.msgContainer}>
            {
                this.props.msgArr.map((msg,index)=>{
                    if(msg.isMine){
                       return <div key={msg.msgId} className="message--div">
                                <div>
                                   <img className="message--delete" src={TrashIcon} alt="" onClick={this.deleteMessage} data-id={msg.msgId}/>
                                </div>
                                <div className="message message__mine u-margin-bottom">
                                    <p className="message--userName normal-text u-margin-bottom-small" style={{display: "inline-block"}}>{msg.id}</p><br/>
                                    <p className="normal-text message--text" style={{display: "inline-block"}}>{msg.msg}</p> 
                                </div>
                            </div> 
                    }else{
                       return (
                        <div key={index} style={{display: "flex", justifyContent: "flex-start"}}>  
                            <div className="message message__peer u-margin-bottom">
                                        <p className="message--userName normal-text u-margin-bottom-small" style={{display: "inline-block"}}>{msg.id}</p><br/>
                                        <p className="normal-text message--text" style={{display: "inline-block"}}>{msg.msg}</p> 
                                </div>
                        </div>
                        )
                    }
                })
            }
        </div>
         );
    }
}
 
export default Messages;
 