import React from "react";
const IndexContext = React.createContext({
    operateStatus: false,
    loginVisible: false,
    registerVisible: false,
    loginStatus: false,
    code: '',
});
export default IndexContext;
