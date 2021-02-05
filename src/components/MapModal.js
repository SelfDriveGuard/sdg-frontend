import React from "react";
import {Modal} from 'antd';
import {CAR, XVIZ_STYLE} from "../constants";
import {LogViewer, VIEW_MODE} from "streetscape.gl";

const EgoModal = (props) => {
    const {visible, cancel, log, layers, hoverLog} = props;
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
                                showTooltip={!hoverLog.showHover}
                                viewMode={VIEW_MODE["TOP_DOWN"]}
                                customLayers={layers}
                            />
                        </div>
                        {hoverLog.showHover ? (
                            <div style={{

                                left: hoverLog.hoverObject.x,
                                top: hoverLog.hoverObject.y
                            }} className="map-hover-modal">
                                <p><span className="label">roadId:</span> {hoverLog.hoverObject.roadId}</p>
                                <p><span className="label">laneId:</span> {hoverLog.hoverObject.laneId}</p>
                            </div>
                            ) : (
                            <></>
                        )}
                    </Modal> : ''}
        </>
    )
};
export default EgoModal;
