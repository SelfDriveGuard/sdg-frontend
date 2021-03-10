import React, {useState, useEffect, useContext} from "react";
import {Dropdown} from 'antd';
import Login from "./Login";
import Register from "./Register";
import Purchase from "./PurchaseModal";
import IndexContext from "../context";
import MyServer from "./MyServer";
import {logoutApi, meApi} from "../api";

const Header = () => {
    const {loginVisible, registerVisible, loginStatus, dispatch} = useContext(IndexContext);
    const [purchaseVisible, setPurchaseVisible] = useState(false);
    const [myServerVisible, setMyServerVisible] = useState(false);
    useEffect(() => {
        (async () => {
            const {data} = await meApi();
            dispatch({type: 'SET_LOGIN_STATUS', status: data});
        })();
    }, [dispatch]);
    const handlePurchase = () => {
        if(loginStatus) {
            setPurchaseVisible(true)
        } else {
            dispatch({type: 'SET_LOGIN', status: true});
        }
    };
    const logout = async () => {
        await logoutApi();
        dispatch({type: 'SET_LOGIN_STATUS', status: false});
    };
    return (
        <div className="header">
            <div className="header-inner">
                <div>自动驾驶模拟测试云平台</div>
                <div className="header-btn-group">
                    <button className="header-purchase" onClick={handlePurchase}>购买
                    </button>
                    {
                        loginStatus ?
                            <Dropdown overlay={
                                <div className="user-overlay">
                                    <p onClick={
                                        () => {
                                            setMyServerVisible(true)
                                        }
                                    }>我的服务器</p>
                                    <p onClick={logout}>退出登录</p>
                                </div>
                            } placement="bottomCenter" trigger={['click']}>
                                <i className="iconfont iconuser" onClick={e => e.preventDefault()}/>
                            </Dropdown>
                            :
                            <>
                                <span className="header-btn" onClick={
                                    () => {
                                        dispatch({type: 'SET_LOGIN', status: true});
                                    }
                                }>登录</span>
                                <span className="header-btn" onClick={
                                    () => {
                                        dispatch({type: 'SET_REGISTER', status: true});
                                    }
                                }>注册</span>
                            </>
                    }
                </div>
            </div>
            <Login visible={loginVisible}/>
            <Register visible={registerVisible}/>
            <Purchase visible={purchaseVisible} cancel={() => {
                setPurchaseVisible(false)
            }}/>
            <MyServer visible={myServerVisible} cancel={() => {
                setMyServerVisible(false)
            }}/>
        </div>
    )
};

export default Header;
