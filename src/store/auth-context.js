import React, {useState ,useEffect, useCallback} from "react";

let logoutTimer;

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {}
})

const calcRemainingTime = (expirationTime) => {
    const currentTiem = new Date().getTime();

    // expirationTime to timestamp
    const adjExpirationTime = new Date(expirationTime).getTime();

    const remainingDuration = adjExpirationTime - currentTiem;

    return remainingDuration
}

const retriveToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationTime = localStorage.getItem('expirationTime');
    const remainingTime = calcRemainingTime(storedExpirationTime);

    if(remainingTime <= 60000 ) {
        localStorage.removeItem('token')
        localStorage.removeItem('expirationTime')
        return null
    }

    return {
        token: storedToken,
        duration: remainingTime
    }

}

export const AuthContextProvider = (props) => {
    let tokenData = retriveToken()
    let initToken;
    if(tokenData) {
        initToken = tokenData;
    }

    const [token, setToken] = useState(initToken);

    // string to boolean
    const userIsLoggedIn = !!token;

    const loginHandler = (token, expirationTime) => {
        setToken(token);
        localStorage.setItem('token',token)
        localStorage.setItem('expirationTime',expirationTime)
        const remaingTime = calcRemainingTime(expirationTime);

        logoutTimer = setTimeout(logoutHandler, remaingTime);
    }

    // 讓 function 不會 recreate
    const logoutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');

        if(logoutTimer) clearTimeout(logoutTimer);
    },[])

    // reload 後 logoutTimer 會減少
    useEffect(() => {
        if(tokenData) {
            console.log(tokenData.duration)
            logoutTimer = setTimeout(logoutHandler, tokenData.duration);
        }
    },[tokenData, logoutHandler])

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    )
}
export default AuthContext;