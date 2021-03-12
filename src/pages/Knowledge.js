import React, {useEffect, useRef, useState} from "react";
import '../static/style/knowledge.less';
import {getExampleApi} from '../api';
import {message, Select, Tree} from "antd";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import CodeMirror from "@uiw/react-codemirror";
import 'codemirror/keymap/sublime';
import 'codemirror/theme/base16-dark.css';

const {Option} = Select;
const tree = [{
    "name": "C-NCAP",
    "isLeaf": false,
    "key": "0-0",
    "children": [{
        "name": "人行通道",
        "key": "0-0-1",
        "isLeaf": true,
    }, {
        "name": "十字路口",
        "key": "0-0-2",
        "isLeaf": true,
    }, {
        "name": "跟车",
        "key": "0-0-3",
        "isLeaf": true,
    }, {
        "name": "限速",
        "key": "0-0-4",
        "isLeaf": true,
    },]
}, {
    "folderName": "E-NCAP",
    "name": "E-NCAP",
    "isLeaf": false,
    "key": "0-1",
    "children": []
}];

const Knowledge = () => {
    const [treeData, setTreeData] = useState([]);
    const [selectNode, setSelectNode] = useState({
        key: '0-0-0',
    });
    const [lang, setLang] = useState('scenest');
    const [code, setCode] = useState('');
    const codeMirror = useRef();

    useEffect(() => {
        (async () => {
            renderTreeData(tree);
            await getCode('人行通道', lang);
        })()
    }, []);

    const handleTreeSelect = async (key, info) => {
        setSelectNode(info.node);
        await getCode(info.node.name , lang);
    };
    const handleCopy = () => {
        message.success('复制成功');
    };

    const langChange = async (val) => {
        setLang(val);
        await getCode(selectNode.name , val);
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
                <div className="menu-top">场景库</div>
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
                        <div className="main-top-label">语言：</div>
                        <Select placeholder="请选择语言"
                                onChange={langChange}
                                className="select-left" defaultValue={'scenest'}>
                            <Option value={'scenest'}># scenest</Option>
                            <Option value={'scenic'}># scenic</Option>
                        </Select>
                    </div>

                    <CopyToClipboard onCopy={handleCopy}
                                     text={code}>
                        <div className="btn"><i className="iconfont icondocument"/>复制</div>
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
