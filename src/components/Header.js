import React, {useState, useEffect, useContext} from "react";
import {Dropdown} from 'antd';
import Login from "./Login";
import Register from "./Register";
import Purchase from "./PurchaseModal";
import IndexContext from "../context";
import MyServer from "./MyServer";
import {logoutApi, meApi} from "../api";
import { useI18n, setLang } from 'use-i18n';

const Header = () => {
    const {loginVisible, registerVisible, userInfo, dispatch} = useContext(IndexContext);
    const [purchaseVisible, setPurchaseVisible] = useState(false);
    const [myServerVisible, setMyServerVisible] = useState(false);
    const [lang, setNewLang] = setLang();
    const t = useI18n();

    useEffect(() => {
        (async () => {
            const {data} = await meApi();
            dispatch({type: 'SET_USER_INFO', userInfo: data});
        })();
    }, [dispatch]);

    const changeLang = (lang) => {
        setNewLang(lang);
    };

    const handlePurchase = () => {
        if (userInfo) {
            setPurchaseVisible(true)
        } else {
            dispatch({type: 'SET_LOGIN', status: true});
        }
    };
    const logout = async () => {
        await logoutApi();
        dispatch({type: 'SET_USER_INFO', userInfo: false});
    };
    return (
        <div className="header">
            <div className="header-inner">
                <div>自动驾驶模拟测试云平台</div>
                <div className="header-btn-group">
                    <button className="header-purchase" onClick={handlePurchase}>{t.buy}</button>
                    {lang === 'en-US' ?
                        <i className="iconfont iconzhongwen lang" onClick={() => {changeLang('zh-CN')}}/> :
                        <i className="iconfont iconyingwen lang" onClick={() => {changeLang('en-US')}}/>}
                    {
                        userInfo ?
                            <Dropdown overlay={
                                <div className="user-overlay">
                                    <p onClick={
                                        () => {
                                            setMyServerVisible(true)
                                        }
                                    }>{t.myServer}</p>
                                    {/*{userInfo.dev ? <p>Fuzz配置</p> : ''}*/}
                                    <p onClick={logout}>{t.logout}</p>
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
                                }>{t.login}</span>
                                <span className="header-btn" onClick={
                                    () => {
                                        dispatch({type: 'SET_REGISTER', status: true});
                                    }
                                }>{t.register}</span>
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
