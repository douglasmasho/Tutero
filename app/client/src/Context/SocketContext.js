import React, { Component, createContext } from 'react';
import io from "socket.io-client";

export const socketContext = createContext();

export class SocketContextProvider extends Component {
    state = {
        socket: io.connect("/"),
    }
    render() {
        console.log(this.state.socket)
        return (
           <socketContext.Provider value={this.state.socket}>
               {this.props.children}
           </socketContext.Provider>
        )
    }
}

export default SocketContextProvider
