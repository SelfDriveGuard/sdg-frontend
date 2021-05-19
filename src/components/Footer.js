import React, {useContext, useEffect, useState} from "react";
import IndexContext from "../context";
import {useI18n} from "../plugins/use-i18n";

let dragAble = false;
let oldY = 0;

const Footer = () => {
    const {operateStatus, assertion, outputMsg} = useContext(IndexContext);
    const [tab, setTab] = useState(0);
    const [cont, setCont] = useState(Object);

    const [height, setHeight] = useState(38);

    const t = useI18n();

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

    const handleFold = (height) => {
        setHeight(height);
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
                             }}>{t.output}
                        </div>
                        <div className={`footer-tab ${tab === 1 ? 'active' : ''}`}
                             onClick={() => {
                                 tabChange(1)
                             }}>{t.assert}
                        </div>
                    </div>
                    <div className="footer-right">
                        {height === 38 ?
                            <i className="iconfont iconarrow active" onClick={() => {handleFold(250)}}/> :
                            <i className="iconfont iconarrow" onClick={() => {handleFold(38)}}/>}
                    </div>
                </div>
            </div>
            <div className="footer-main">
                <div
                    className="footer-inner">
                    {tab === 0 ? <div>
                        {outputMsg && outputMsg.map((item, index) => {
                            return <div key={index}>
                                {item.cmd && item.cmd !== 'CRITERIA'? <span>cmd: {item.cmd} msg: </span> : ''}
                                {item.msg && item.msg.hasOwnProperty('list') ?
                                    <div>
                                        <p>{t.testResult}: </p>
                                        <p className="score">{t.score}: {item.msg.score}</p>
                                        <div className="footer-thead">
                                            <p className="column1">Criterion</p>
                                            <p className="column2">Result</p>
                                            <p className="column3">Value</p>
                                        </div>
                                        <div className="footer-tbody">
                                            {item.msg.list.map((listItem, listIndex) => {
                                                return <div key={listIndex} className="footer-tcell">
                                                    <p className="column1">{listItem.criterion}</p>
                                                    <p className="column2">{listItem.result}</p>
                                                    <p className="column3">{listItem.penalty}</p>
                                                </div>
                                            })}
                                        </div>
                                    </div>
                                    : <span>{item.msg}</span>}
                            </div>
                        })}
                    </div> : cont && <div>{cont.map((item, index) => {
                        return <div key={index}>
                            {index + 1}
                            <div>{t.type}：{item.type}</div>
                            <div>{t.timeStamp}：{item.timestamp}</div>
                            <div>{t.desc}：{item.description}</div>
                        </div>
                    })}</div>
                    }
                </div>
            </div>
        </div>
    )
};

export default Footer;
