import React, { Component, createContext } from 'react';
import io from "socket.io-client";
import {nanoid} from "nanoid";


export const UIDContext = createContext();

export class UIDContextProvider extends Component {
    state = {
        uid: `${Math.round(Math.random())}-${nanoid(7)}`,
    }
    render() {
        return (
           <UIDContext.Provider value={this.state.uid}>
               {this.props.children}
           </UIDContext.Provider>
        )
    }
}

export default UIDContextProvider
