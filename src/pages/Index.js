import React, {useReducer} from "react";
import '../static/style/Index.less';
import Header from '../components/Header';
import Main from '../components/Main';
import Footer from '../components/Footer';

import IndexContext from "../context";
import {defaultState, reducer} from '../reducer';

const Index = () => {
    const [state, dispatch] = useReducer(reducer, defaultState);
    return (
        <IndexContext.Provider value={{...state, dispatch}}>
            <div className="index">
                <Header/>
                <Main/>
                <Footer/>
            </div>
        </IndexContext.Provider>
    )
};

export default Index;
