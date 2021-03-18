import React, {useState, useContext} from "react";
import {Modal, Input, message} from 'antd';
import IndexContext from "../context";
import {registerApi} from '../api';
import {useI18n} from "use-i18n";
import {getQueryVariable} from '../utils';

const Register = () => {
    const {registerVisible, dispatch} = useContext(IndexContext);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const t = useI18n();

    const cancelModal = () => {
        setUserName('');
        setPassword('');
        dispatch({type: 'SET_REGISTER', status: false});
    };
    const changeUserName = (val) => {
        setUserName(val.target.value);
    };
    const changePassword = (val) => {
        setPassword(val.target.value);
    };
    const handleRegister = async () => {
        const role = getQueryVariable('role');
        await registerApi({
            userName,
            password,
            dev: role === 'dev',
        });
        cancelModal();
        message.success(t.registerSuccess);
    };
    return (
        <Modal
            className="login"
            visible={registerVisible}
            width={500}
            onCancel={cancelModal}
            footer={null}
            centered
            title={t.registerTitle}>
            <Input placeholder={t.accountPlaceholder} className="userName" onChange={changeUserName} value={userName}/>
            <Input placeholder={t.pwdPlaceholder} className="password" type="password"
                   onChange={changePassword} value={password}/>
            <button className="login-btn" onClick={handleRegister}>{t.register}</button>
        </Modal>
    )
};
export default Register;
