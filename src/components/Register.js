import React, {useState, useContext} from "react";
import {Modal, Input, message} from 'antd';
import IndexContext from "../context";
import {registerApi} from '../api';
const Register = () => {
    const {registerVisible, dispatch} = useContext(IndexContext);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
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
        await registerApi({
            userName,
            password,
        });
        cancelModal();
        message.success('注册成功！');
    };
    return (
        <Modal
            className="login"
            visible={registerVisible}
            width={500}
            onCancel={cancelModal}
            footer={null}
            centered
            title="账号注册">
            <Input placeholder="请输入用户名" className="userName" onChange={changeUserName} value={userName}/>
            <Input placeholder="请输入密码" className="password" type="password"
                   onChange={changePassword} value={password}/>
            <button className="login-btn" onClick={handleRegister}>注册</button>
        </Modal>
    )
};
export default Register;
