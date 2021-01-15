import React, {useState, useEffect, useContext} from "react";
import {Tree, Dropdown} from 'antd';
import AddProjectModal from './AddProjectModal';
import RenameModal from "./RenameModal";
import {getTreeApi} from '../api';
import IndexContext from "../context";

const Menu = () => {
    const {dispatch} = useContext(IndexContext);

    const [addVisible, setAddVisible] = useState(false);
    const [renameVisible, setRenameVisible] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [selectNode, setSelectNode] = useState({});
    const handleRename = (e) => {
        setRenameVisible(true);
    };

    const dropDownFather =
        <Dropdown
            overlay={
                <div className="tree-dropdown">
                    <p onClick={handleRename}>重命名</p>
                </div>
            } placement="bottomCenter" trigger={['click']}>
            <i className="iconfont iconellipsis"/>
        </Dropdown>;

    const dropDownChild = <Dropdown
        overlay={
            <div className="tree-dropdown">
                <p onClick={handleRename}>重命名</p>
                <p>删除</p>
                <p>下载</p>
            </div>
        } placement="bottomCenter" trigger={['click']}>
        <i className="iconfont iconellipsis"/>
    </Dropdown>;

    const getTreeData = async () => {
        const {data} = await getTreeApi();
        data.forEach((item) => {
            item.title =
                <div className="father-tree">
                    <div>
                        <i className="iconfont iconxiangmu"/>
                        <span>{item.name}</span>
                    </div>
                    {dropDownFather}
                </div>;
            item.children.forEach((innerItem) => {
                innerItem.title =
                    <div className="child-tree">
                        <div>
                            <i className="iconfont icondocument"/>
                            <span>{innerItem.name}</span>
                        </div>
                        {dropDownChild}
                    </div>
            });
        });
        setTreeData(data);
    };

    useEffect(() => {
        (async () => {
            await getTreeData();
        })()
    }, []);

    const updateSuccess = async () => {
        await getTreeData();
    };

    const handleTreeSelect = (key, info) => {
        if(info.node.isLeaf) {
            dispatch({type: 'SET_CODE', code: info.node.code});
        }
        setSelectNode(info.node);
    };

    return (
        <div className="main-menu">
            <div className="menu-top">
                <span>项目管理</span>
                <i className="iconfont iconplus-circle" onClick={() => {
                    setAddVisible(true)
                }}/>
            </div>
            <div className="main-cont">
                <Tree
                    onSelect={handleTreeSelect}
                    showIcon
                    defaultExpandAll
                    defaultSelectedKeys={['0-0-0']}
                    treeData={treeData}
                />
            </div>
            <AddProjectModal visible={addVisible}
                             updateSuccess={updateSuccess}
                             cancel={() => {
                setAddVisible(false)
            }}/>
            <RenameModal visible={renameVisible}
                         updateSuccess={updateSuccess}
                         selectNode={selectNode}
                         cancel={() => {
                setRenameVisible(false)
            }}/>
        </div>
    )
};
export default Menu;
