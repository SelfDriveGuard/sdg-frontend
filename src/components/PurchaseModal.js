import React, {useState, useEffect, useContext} from "react";
import {Modal, message} from 'antd';
import {getServersApi, buyServerApi, myServerApi} from '../api';
import IndexContext from "../context";
import {useI18n} from "../plugins/use-i18n";

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

    const t = useI18n();

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
            item.key = index;
        });
        const server = data.filter((item) => {
            return !item._user;
        });
        setGoods(server);
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

        message.success(t.buySuccess);
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
            title={t.buyNow}>
            <div className="purchase">
                {goods.map((item) => {
                    return <div className="purchase-item" key={item.key}>
                        <div className="purchase-cont">
                            <div className="purchase-top">
                                {t.project}{item.name}
                            </div>
                            <div className="purchase-inner">
                                <p>{item.simulator}</p>
                                <p>+</p>
                                <p>{item.avSystem}</p>
                            </div>
                        </div>
                        <div className="purchase-btn" onClick={() => {handleBuy(item)}}>
                            <span>¥ 100</span>
                            <span>{t.buy}</span>
                        </div>
                    </div>
                })}

            </div>
        </Modal>
    )
};
export default Purchase;
