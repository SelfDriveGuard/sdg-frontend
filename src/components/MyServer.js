import React, {useState, useEffect, useContext} from "react";
import {Modal, Table} from 'antd';
import IndexContext from "../context";
const columns = [
    {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
    },
    {
        title: '产品配置',
        dataIndex: 'config',
        key: 'config',
        render: (text, record) => {
           return <>{record.simulator} + {record.avSystem}</>
        },
    },
];

const MyServer = (props) => {
    const {visible, cancel} = props;
    const [table, setTable] = useState([]);
    const {myServer} = useContext(IndexContext);

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
            title="我的服务器">
            <Table columns={columns} dataSource={table} pagination={false} className="server-table"/>
        </Modal>
    )
};
export default MyServer;
