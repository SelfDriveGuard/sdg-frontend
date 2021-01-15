import React, {useContext, useState} from "react";
import {Modal, Input, message} from 'antd';
import IndexContext from "../context";
import {loginApi} from '../api/index';

const Login = () => {
    const {loginVisible, dispatch} = useContext(IndexContext);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const cancelModal = () => {
        setUserName('');
        setPassword('');
        dispatch({type: 'SET_LOGIN', status: false});
    };
    const changeUserName = (val) => {
        setUserName(val.target.value);
    };
    const changePassword = (val) => {
        setPassword(val.target.value);
    };
    const handleToRegister = () => {
        cancelModal();
        dispatch({type: 'SET_REGISTER', status: true});
    };
    const handleLogin = async () => {
        await loginApi({
            userName,
            password,
        });
        cancelModal();
        message.success('登录成功');
        dispatch({type: 'SET_LOGIN_STATUS', status: true});
    };
    return (
        <Modal
            className="login"
            visible={loginVisible}
            width={500}
            onCancel={cancelModal}
            footer={null}
            centered
            title="账号登录">
            <Input placeholder="请输入用户名" className="userName" onChange={changeUserName} value={userName}/>
            <Input placeholder="请输入密码" className="password" type="password"
                   onChange={changePassword} value={password}/>
            <p className="login-tip" onClick={handleToRegister}>去注册</p>
            <button className="login-btn" onClick={handleLogin}>登录</button>
        </Modal>
    )
};
export default Login;
