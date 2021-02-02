import React, {useContext, useEffect, useState} from "react";
import IndexContext from "../context";

const ScenarioInfo = 'Map name: San Francisco<br/>' +
    'ego vehicle info:<br/>' +
    'Init position = (4.5, 214)<br/>' +
    'Target position = (4.5, -200)<br/>' +
    'Car model = "Lincoln MKZ 2017"<br/>' +
    'Car color = (255, 0, 0)<br/>' +
    'environment:<br/>' +
    'time = 10:00;<br/>' +
    'weather = {rain: 0.1}';

const AssertInfo = 'Type: overspeed detection<br/>' +
    'Speed limitation at (4.5, 214) position is : 45m/s<br/>' +
    'Ego char speed is: 60m/s';
let dragAble = false;
let oldY = 0;
const Footer = () => {
    const {operateStatus, assertion} = useContext(IndexContext);
    const [tab, setTab] = useState(0);
    const [cont, setCont] = useState(Object);

    const [height, setHeight] = useState(38);
    useEffect(() => {
        const initHeight = document.body.clientHeight - 716;
        setHeight(initHeight);
    }, []);
    useEffect(() => {
        if(operateStatus) {
            if(tab === 0) {
                setCont(ScenarioInfo);
            } else {
                setCont(assertion);
            }
        }
    }, [operateStatus, tab]);
    const tabChange = (val) => {
        setTab(val);
        if(operateStatus) {
            if(val === 0) {
                setCont(ScenarioInfo);
            } else {
                setCont(assertion);
            }
        }
    };

    const handleMousedown = (e) => {
        e.preventDefault();
        dragAble = true;
        oldY = e.pageY;
        setHeight(document.getElementById('footer').clientHeight);
        document.onmousemove = (event) => {
            if(dragAble) {
                const y = oldY - event.pageY + height;
                if(y < 38) return;
                setHeight(y);
            }
        };
        document.onmouseup = (event) => {
            dragAble = false;
        };
    };

    return (
        <div className="footer" style={{height: `${height}px`}} id="footer">
            <div className="footer-top"
                 onMouseDown={handleMousedown}>
                <div className="footer-top-inner">
                    <div className="footer-tabs">
                        <div className={`footer-tab ${tab === 0 ? 'active': ''}`}
                             onClick={() => {tabChange(0)}}>Scenario信息</div>
                        <div className={`footer-tab ${tab === 1 ? 'active': ''}`}
                             onClick={() => {tabChange(1)}}>Assert关键点</div>
                    </div>
                    <div className="footer-right">
                        <button className="play-btn">
                            <i className="iconfont iconvideo"/>
                            视频回放</button>
                    </div>
                </div>
            </div>
            <div className="footer-main">
                {operateStatus ? <div
                    className="footer-inner">
                        { tab == 0 ? <div 
                            dangerouslySetInnerHTML={{__html:cont}}>
                            </div> : <div>{cont.map((item, index) => {
                                    return <div key={index}>
                                        {index+1}
                                        <div>类型：{item.type}</div>
                                        <div>时间戳：{item.timestamp}</div>
                                        <div>描述：{item.description}</div>
                                    </div>
                                })}</div>
                        }
                </div> : ''}
                
            </div>
        </div>
    )
};

export default Footer;
