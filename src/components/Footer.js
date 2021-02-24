import React, {useContext, useEffect, useState} from "react";
import IndexContext from "../context";

let dragAble = false;
let oldY = 0;
const Footer = () => {
    const {operateStatus, assertion, outputMsg} = useContext(IndexContext);
    const [tab, setTab] = useState(0);
    const [cont, setCont] = useState(Object);

    const [height, setHeight] = useState(38);
    useEffect(() => {
        const initHeight = document.body.clientHeight - 716;
        setHeight(initHeight);
    }, []);
    useEffect(() => {
        if (tab === 0) {
            setCont(outputMsg);
        } else {
            setCont(assertion);
        }
    }, [operateStatus, tab, assertion, outputMsg]);

    const tabChange = (val) => {
        setTab(val);
    };

    const handleMousedown = (e) => {
        e.preventDefault();
        dragAble = true;
        oldY = e.pageY;
        setHeight(document.getElementById('footer').clientHeight);
        document.onmousemove = (event) => {
            if (dragAble) {
                const y = oldY - event.pageY + height;
                if (y < 38) return;
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
                        <div className={`footer-tab ${tab === 0 ? 'active' : ''}`}
                             onClick={() => {
                                 tabChange(0)
                             }}>Output信息
                        </div>
                        <div className={`footer-tab ${tab === 1 ? 'active' : ''}`}
                             onClick={() => {
                                 tabChange(1)
                             }}>Assert关键点
                        </div>
                    </div>
                    <div className="footer-right">
                        {/*<button className="play-btn">*/}
                        {/*    <i className="iconfont iconvideo"/>*/}
                        {/*    视频回放</button>*/}
                    </div>
                </div>
            </div>
            <div className="footer-main">
                <div
                    className="footer-inner">
                    {tab === 0 ? <div>
                        {outputMsg && outputMsg.map((item, index) => {
                            return <div key={index}>
                                {item.cmd ? <span>cmd: {item.cmd} msg: </span> : ''}
                                <span> {item.msg}</span>
                            </div>
                        })}
                    </div> : cont && <div>{cont.map((item, index) => {
                        return <div key={index}>
                            {index + 1}
                            <div>类型：{item.type}</div>
                            <div>时间戳：{item.timestamp}</div>
                            <div>描述：{item.description}</div>
                        </div>
                    })}</div>
                    }
                </div>
            </div>
        </div>
    )
};

export default Footer;
