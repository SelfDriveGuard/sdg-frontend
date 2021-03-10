import React, {useState} from "react";
import {Modal, Button, Input, message} from 'antd';
import {addProjectApi} from '../api';

const AddProjectModal = (props) => {
    const {visible, cancel, updateSuccess} = props;
    const [project, setProject] = useState('');
    const [name, setName] = useState('');
    const cancelModal = () => {
        setProject('');
        setName('');
        cancel();
    };
    const submit = async () => {
        await addProjectApi({
            name,
            project,
        });
        message.success('创建成功');
        updateSuccess();
        cancelModal();
    };
    const projectChange = (val) => {
        setProject(val.target.value);
    };

    const nameChange = (val) => {
        setName(val.target.value);
    };

    return (
        <Modal
            className="login"
            visible={visible}
            width={500}
            onCancel={cancelModal}
            footer={[
                <Button key="submit" type="primary" onClick={submit}>
                    确认
                </Button>,
                <Button key="back" onClick={cancelModal}>
                    取消
                </Button>,
            ]}
            centered
            title="添加项目">
            {/*<Select placeholder="请选择或输入项目名称"*/}
            {/*        onChange={projectChange}*/}
            {/*        showSearch*/}
            {/*        className="add-select" defaultValue={undefined}>*/}
            {/*    {projects.map((item) => {*/}
            {/*        return <Option value={item} key={item}>{item}</Option>*/}
            {/*    })}*/}
            {/*</Select>*/}
            <Input className="add-select"
                   onChange={projectChange}
                   value={project}
                   placeholder="请选择或输入项目名称"/>
            <Input className="add-input"
                   value={name}
                   onChange={nameChange}
                   placeholder="请输入文件名称"/>
        </Modal>
    )
};
export default AddProjectModal;
