import React, {useState} from "react";
import {Modal, Button, Input, message} from 'antd';
import {updateProjectApi} from '../api';

const RenameModal = (props) => {
    const {visible, cancel, selectNode, updateSuccess} = props;
    const [updateName, setUpdateName] = useState('');
    const cancelModal = () => {
        setUpdateName('');
        cancel();
    };
    const nameChange = (val) => {
        setUpdateName(val.target.value);
    };

    const submit = async () => {
        const {path, isLeaf, folderName} = selectNode;
        await updateProjectApi({
            updateName,
            isLeaf,
            folderName,
            oldPath: path,
        });
        message.success('重命名成功');
        updateSuccess();
        cancelModal();
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
            title="重命名">
            <Input className="add-input" onChange={nameChange} value={updateName} placeholder="请输入文件名称"/>
        </Modal>
    )
};
export default RenameModal;
