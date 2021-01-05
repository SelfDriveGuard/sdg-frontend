import React from "react";
import {Modal, Button, Input, Radio} from 'antd';

const ObstacleModal = (props) => {
    const {visible, cancel} = props;
    const cancelModal = () => {
        cancel();
    };
    return (
        <Modal
            className="ego-modal"
            visible={visible}
            width={500}
            onCancel={cancelModal}
            footer={[
                <Button key="back" onClick={cancelModal}>
                    取消
                </Button>,
                <Button key="submit" type="primary" onClick={cancelModal}>
                    提交
                </Button>,
            ]}
            title="障碍物参数">
            <div className="ego-line">
                <div className="ego-label">
                    目标状态：
                </div>
                <div>
                    X：<Input/>
                    Y: <Input/>
                </div>
            </div>
            <div className="ego-line">
                <div className="ego-label">
                    车辆类型：
                </div>
                <div>
                    <Radio.Group defaultValue={1}>
                        <Radio value={1}>球</Radio>
                        <Radio value={2}>立方体</Radio>
                        <Radio value={3}>圆锥</Radio>
                        <Radio value={4}>圆柱</Radio>
                    </Radio.Group>
                </div>
            </div>
        </Modal>
    )
};
export default ObstacleModal;
