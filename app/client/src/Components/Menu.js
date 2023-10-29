import React, {Component} from "react";
import {Link} from "react-router-dom";


export default class Menu extends Component{
    constructor(){
        super();
        this.linkClick = this.linkClick.bind(this);
    }


    linkClick(event){
        let currentLink = document.querySelector(".activeLink");
        if(currentLink){
            currentLink.classList.remove("activeLink")
        }
        event.currentTarget.classList.add("activeLink");
    }

    componentDidMount(){
        let links = document.querySelectorAll(".menu--link");
        links.forEach((link)=>{
            link.addEventListener("click", this.linkClick);
        })
    }

    render(){
        return (<div className="menu--container">
                   <label htmlFor="smenu-1" className="menu--sub"><i className="fas fa-home menu__icon"></i>Home</label>
                   <input type="checkbox" id="smenu-1" className="checkBox"/>
                    <div className="menu--content menu--content__1">
                            <Link className="menu--link" to="/">Dashboard</Link>
                            <Link className="menu--link" to="/directs">Direct Messages</Link>
                            <Link className="menu--link" to="/createRoom">Create Room</Link>
                    </div>

                    <label htmlFor="smenu-2" className="menu--sub"><i className="far fa-user menu__icon"></i>User</label>
                    <input type="checkbox" id="smenu-2" className="checkBox"/>
                    <div className="menu--content menu--content__2">
                            <Link className="menu--link" to="/account"><span>My Account</span></Link>
                            {/* <Link className="menu--link" to="/test"><span>Test(For dev purposes)</span></Link> */}

                    </div>

                </div>
            )
    }
}

