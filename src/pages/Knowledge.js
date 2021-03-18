import React, {useEffect, useRef, useState} from "react";
import '../static/style/knowledge.less';
import {getExampleApi} from '../api';
import {message, Select, Tree} from "antd";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import CodeMirror from "@uiw/react-codemirror";
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';
import {useI18n} from "use-i18n";

const {Option} = Select;

const Knowledge = () => {
    const [treeData, setTreeData] = useState([]);
    const [selectNode, setSelectNode] = useState({
        key: '0-0-0',
    });
    const [lang, setLang] = useState('scenest');
    const [code, setCode] = useState('');
    const codeMirror = useRef();

    const t = useI18n();

    const tree = [{
        "name": "C-NCAP",
        "originName": "C-NCAP",
        "isLeaf": false,
        "key": "0-0",
        "children": [{
            "name": t.passageway,
            "originName": "人行通道",
            "key": "0-0-1",
            "isLeaf": true,
        }, {
            "name": t.crossroads,
            "originName": "十字路口",
            "key": "0-0-2",
            "isLeaf": true,
        }, {
            "name": t.following,
            "originName": "跟车",
            "key": "0-0-3",
            "isLeaf": true,
        }, {
            "name": t.speedLimit,
            "originName": "限速",
            "key": "0-0-4",
            "isLeaf": true,
        },]
    }, {
        "name": "E-NCAP",
        "originName": "E-NCAP",
        "isLeaf": false,
        "key": "0-1",
        "children": []
    }];

    useEffect(() => {
        (async () => {
            renderTreeData(tree);
            await getCode('人行通道', lang);
        })()
    }, []);

    const handleTreeSelect = async (key, info) => {
        setSelectNode(info.node);
        if(info.node.isLeaf) await getCode(info.node.originName , lang);
    };
    const handleCopy = () => {
        message.success(t.copySuccess);
    };

    const langChange = async (val) => {
        setLang(val);
        await getCode(selectNode.originName , val);
    };

    const getCode = async (name, lang) => {
        const {data} = await getExampleApi({
            name: `${name}.${lang}`
        });
        setCode(data);
    };

    const renderTreeData = (data) => {
        data.forEach((item) => {
            item.title =
                <div className="father-tree">
                    <div>
                        <i className="iconfont iconxiangmu"/>
                        <span>{item.name}</span>
                    </div>
                </div>;
            item.children.forEach((innerItem) => {
                innerItem.title =
                    <div className="child-tree">
                        <div>
                            <i className="iconfont icondocument"/>
                            <span>{innerItem.name}</span>
                        </div>
                    </div>
            });
        });
        setTreeData(data);
        setSelectNode(data[0].children[0]);
    };

    return (
        <div className="knowledge">
            <div className="knowledge-menu">
                <div className="menu-top">{t.scene}</div>
                <Tree
                    selectedKeys={[selectNode.key]}
                    onSelect={handleTreeSelect}
                    showIcon
                    expandedKeys={['0-0', '0-1']}
                    treeData={treeData}
                />
            </div>
            <div className="knowledge-main">
                <div className="main-top">
                    <div className="main-top-left">
                        <div className="knowledge-title">{selectNode.name && selectNode.name.split('.')[0]}</div>
                        <div className="main-top-label">{t.lang}：</div>
                        <Select placeholder={t.chooseLang}
                                onChange={langChange}
                                className="select-left" defaultValue={'scenest'}>
                            <Option value={'scenest'}># scenest</Option>
                            <Option value={'scenic'}># scenic</Option>
                        </Select>
                    </div>

                    <CopyToClipboard onCopy={handleCopy}
                                     text={code}>
                        <div className="btn"><i className="iconfont icondocument"/>{t.copy}</div>
                    </CopyToClipboard>
                </div>
                <div className="main-code">
                    <CodeMirror
                        value={code}
                        ref={codeMirror}
                        options={{
                            theme: 'base16-dark',
                            mode: 'jsx',
                            lineWrapping: true,
                        }}
                    />
                </div>
            </div>
        </div>
    )
};
export default Knowledge;
