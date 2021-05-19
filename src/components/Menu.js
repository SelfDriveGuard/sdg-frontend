import React from "react";
import { NavLink } from "react-router-dom";

const Menu = () => {
    return (
        <div className="menu">
            <NavLink exact to="/console" className="menu-item" activeClassName="active">
                <i className="iconfont iconxiangmu1"/>
            </NavLink>
            <NavLink exact to="/console/knowledge" className="menu-item" activeClassName="active">
                <i className="iconfont iconchangjingku"/>
            </NavLink>
        </div>
    )
};
export default Menu;
