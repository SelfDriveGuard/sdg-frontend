import React from "react";
const IndexContext = React.createContext({
    operateStatus: false,
    loginVisible: false,
    registerVisible: false,
    loginStatus: false,
    code: '',
    myServer: [],
    assertion: [],  //Assert关键点
});
export default IndexContext;
