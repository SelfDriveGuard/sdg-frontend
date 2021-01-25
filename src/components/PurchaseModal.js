import React, {useState, useEffect, useContext} from "react";
import {Modal, message} from 'antd';
import {getServersApi, buyServerApi, myServerApi} from '../api';
import IndexContext from "../context";

const obj = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
};
const Purchase = (props) => {
    const {visible, cancel} = props;
    const [goods, setGoods] = useState([]);
    const {dispatch} = useContext(IndexContext);

    useEffect(() => {
        if(visible) {
            (async () => {
                await getServers();
            })()
        }
    }, [visible]);
    const getServers = async () => {
        const {data} = await getServersApi();
        data.forEach((item, index) => {
            item.name = obj[index];
        });
        setGoods(data);
    };
    const cancelModal = () => {
        cancel();
    };
    const handleBuy = async (item) => {
        await buyServerApi({
            id: item._id,
        });
        const {data} = await myServerApi();
        data.forEach((item, index) => {
            item.key = index;
        });
        dispatch({type: 'SET_MY_SERVER', myServer: data});

        message.success('购买成功');
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
            title="立即购买">
            <div className="purchase">
                {goods.map((item) => {
                    return <div className="purchase-item" key={item.name}>
                        <div className="purchase-cont">
                            <div className="purchase-top">
                                产品{item.name}
                            </div>
                            <div className="purchase-inner">
                                <p>{item.simulator}</p>
                                <p>+</p>
                                <p>{item.avSystem}</p>
                            </div>
                        </div>
                        <div className="purchase-btn" onClick={() => {handleBuy(item)}}>
                            <span>¥ 100</span>
                            <span>购买</span>
                        </div>
                    </div>
                })}

            </div>
        </Modal>
    )
};
export default Purchase;
