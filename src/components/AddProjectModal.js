import React, {useState} from "react";
import {Modal, Button, Input, message} from 'antd';
import {addProjectApi} from '../api';
import {useI18n} from "../plugins/use-i18n";

const AddProjectModal = (props) => {
    const {visible, cancel, updateSuccess} = props;
    const [project, setProject] = useState('');
    const [name, setName] = useState('');
    const t = useI18n();

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
        message.success(t.createSuccess);
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
                    {t.ok}
                </Button>,
                <Button key="back" onClick={cancelModal}>
                    {t.cancel}
                </Button>,
            ]}
            centered
            title={t.addTitle}>
            <Input className="add-select"
                   onChange={projectChange}
                   value={project}
                   placeholder={t.folderPlaceHolder}/>
            <Input className="add-input"
                   value={name}
                   onChange={nameChange}
                   placeholder={t.filePlaceHolder}/>
        </Modal>
    )
};
export default AddProjectModal;
