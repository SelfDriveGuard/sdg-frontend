import React from "react";
import { NavLink } from "react-router-dom";

const Menu = () => {
    return (
        <div className="menu">
            <NavLink exact to="/" className="menu-item" activeClassName="active">
                <i className="iconfont icondocument"/>
            </NavLink>
            <NavLink exact to="/knowledge" className="menu-item" activeClassName="active">
                <i className="iconfont icondocument"/>
            </NavLink>
        </div>
    )
};
export default Menu;
