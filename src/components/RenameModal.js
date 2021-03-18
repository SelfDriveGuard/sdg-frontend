import React, {useState} from "react";
import {Modal, Button, Input, message} from 'antd';
import {updateProjectApi} from '../api';
import {useI18n} from "use-i18n";

const RenameModal = (props) => {
    const {visible, cancel, selectNode, updateSuccess} = props;
    const [updateName, setUpdateName] = useState('');

    const t = useI18n();

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
        message.success(t.renameSuccess);
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
                    {t.ok}
                </Button>,
                <Button key="back" onClick={cancelModal}>
                    {t.cancel}
                </Button>,
            ]}
            centered
            title={t.rename}>
            <Input className="add-input" onChange={nameChange} value={updateName} placeholder={t.enterFileName}/>
        </Modal>
    )
};
export default RenameModal;
