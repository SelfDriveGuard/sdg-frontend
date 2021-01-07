import React from "react";
import {Modal} from 'antd';
import {CAR, XVIZ_STYLE} from "../constants";
import {LogViewer, VIEW_MODE} from "streetscape.gl";

const EgoModal = (props) => {
    const {visible, cancel, log, layers} = props;
    const cancelModal = () => {
        cancel();
    };
    return (
        <>
            {
                log ?
                    <Modal
                        className="map-modal"
                        visible={visible}
                        width={900}
                        footer={null}
                        closeIcon={<i className="iconfont iconclose-square-fill"/>}
                        onCancel={cancelModal}>
                        <div className="log-wrapper">
                            <LogViewer
                                log={log}
                                showMap={false}
                                car={CAR}
                                xvizStyles={XVIZ_STYLE}
                                showTooltip={true}
                                viewMode={VIEW_MODE["TOP_DOWN"]}
                                customLayers={layers}
                            />
                        </div>
                    </Modal> : ''}
        </>
    )
};
export default EgoModal;
