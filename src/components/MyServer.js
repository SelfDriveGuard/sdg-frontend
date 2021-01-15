import React, {useState, useEffect} from "react";
import {Modal, Table} from 'antd';
import {myServerApi} from '../api';
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
    useEffect(() => {
        if(visible) {
            (async () => {
                const {data} = await myServerApi();
                data.forEach((item, index) => {
                   item.key = index;
                });
                setTable(data);
            })()
        }
    }, [visible]);
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
