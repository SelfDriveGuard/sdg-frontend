import React, {useContext, useState} from "react";
import {Modal, Input, message} from 'antd';
import IndexContext from "../context";
import {loginApi, meApi} from '../api/index';
import {useI18n} from "use-i18n";

const Login = () => {
    const {loginVisible, dispatch} = useContext(IndexContext);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const t = useI18n();

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
        const {code} = await loginApi({
            userName,
            password,
        });
        if(!code) {
            message.error(t.loginFail);
            return;
        }
        cancelModal();
        message.success(t.loginSuccess);
        const {data} = await meApi();
        dispatch({type: 'SET_USER_INFO', userInfo: data});
    };
    return (
        <Modal
            className="login"
            visible={loginVisible}
            width={500}
            onCancel={cancelModal}
            footer={null}
            centered
            title={t.loginTitle}>
            <Input placeholder={t.accountPlaceholder} className="userName" onChange={changeUserName} value={userName}/>
            <Input placeholder={t.pwdPlaceholder} className="password" type="password"
                   onChange={changePassword} value={password}/>
            <p className="login-tip" onClick={handleToRegister}>{t.goRegister}</p>
            <button className="login-btn" onClick={handleLogin}>{t.login}</button>
        </Modal>
    )
};
export default Login;
