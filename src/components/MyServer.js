import React, {useState, useEffect, useContext} from "react";
import {Modal, Table} from 'antd';
import IndexContext from "../context";
import {useI18n} from "use-i18n";


const MyServer = (props) => {
    const {visible, cancel} = props;
    const [table, setTable] = useState([]);
    const {myServer} = useContext(IndexContext);
    const t = useI18n();

    const columns = [
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: t.projectConfig,
            dataIndex: 'config',
            key: 'config',
            render: (text, record) => {
                return <>{record.simulator} + {record.avSystem}</>
            },
        },
    ];

    useEffect(() => {
        if(visible) {
            setTable(myServer);
        }
    }, [visible, myServer]);
    const cancelModal = () => {
        cancel();
    };
    return (
        <Modal
            className="login"
            visible={visible}
            width={500}
            onCancel={cancelModal}
            footer={null}
            centered
            title={t.myServer}>
            <Table columns={columns} dataSource={table} pagination={false} className="server-table"/>
        </Modal>
    )
};
export default MyServer;
