import React from "react";
import {Modal, Button, Input, Radio} from 'antd';

const EgoModal = (props) => {
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
            title="控制车辆参数">
            <div className="ego-line">
                <div className="ego-label">
                    初始状态：
                </div>
               <div>
                   X：<Input/>
                   Y: <Input/>
                   速度：<Input/>
               </div>
            </div>
            <div className="ego-line">
                <div className="ego-label">
                    目标状态：
                </div>
                <div>
                    X：<Input/>
                    Y: <Input/>
                    速度：<Input/>
                </div>
            </div>
            <div className="ego-line">
                <div className="ego-label">
                    车辆类型：
                </div>
                <div>
                    <Radio.Group defaultValue={1}>
                        <Radio value={1}>car</Radio>
                        <Radio value={2}>bus</Radio>
                        <Radio value={3}>truck</Radio>
                    </Radio.Group>
                </div>
            </div>
            <div className="ego-line">
                <div className="ego-label">
                    车辆颜色：
                </div>
                <div>
                    <Radio.Group defaultValue={1}>
                        <Radio value={1}>red</Radio>
                        <Radio value={2}>blue</Radio>
                    </Radio.Group>
                </div>
            </div>
        </Modal>
    )
};
export default EgoModal;
