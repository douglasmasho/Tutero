export const setAuthStatus = (status)=>{
    return {
        type: "SET_AUTH_STATUS",
        status
    }
}

export const setUserDetails = (details)=>{
    return {
        type: "SET_DETAILS",
        details
    }
}

export const setUserDoc = (doc)=>{
    return {
        type: "SET_USER_DOC",
        doc
    }
}