import React, {Component, createContext} from 'react';
import io from "socket.io-client";

export const socketContext = createContext();

class SocketContextProvider extends Component {
    state = { 
        socket : io.connect("/"),
     }
    render() { 
        return ( 
            <socketContext.Provider value={this.state.socket}>
                {this.props.children}
            </socketContext.Provider>
         );
    }
}
 
export default SocketContextProvider;