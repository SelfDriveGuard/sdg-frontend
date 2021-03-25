import React from "react";
const IndexContext = React.createContext({
    operateStatus: false,
    loginVisible: false,
    registerVisible: false,
    userInfo: false,
    code: '',
    myServer: [],
    assertion: [],  // Assert关键点
    loading: false, // 全局loading
    outputMsg: [], // output 信息
});
export default IndexContext;
