import React, {useReducer} from "react";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Index from "./pages/Index";
import Knowledge from "./pages/Knowledge";
import IndexContext from "./context";
import {defaultState, reducer} from './reducer';

const AppRouter = () => {
    const [state, dispatch] = useReducer(reducer, defaultState);
    return (
        <IndexContext.Provider value={{...state, dispatch}}>
            <Router>
                <Menu/>
                <Header/>
                <Route path="/" exact component={Index}/>
                <Route path="/knowledge" exact component={Knowledge}/>
            </Router>
        </IndexContext.Provider>
    )
};

export default AppRouter;
