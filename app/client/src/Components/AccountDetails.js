import React from 'react'
import { Link } from 'react-router-dom'

const AccountDetails = ({userDoc, editMode}) => {
    return (
        <div>
            <h1 className="text-size">Your Tutero details</h1>
            <p className="text-size">Display Name: {userDoc.name}</p>
            <p className="text-size">Your user ID is {userDoc.uid}</p>
            <p className="text-size">Type: <span style={{textTransform: "capitalize"}}>{userDoc.type}</span></p>
            <br />
            <p className="text-size">Profile Photo:</p>
            {/* <img className="image" src={userDoc.photoURL} alt="" /> */}
            <div className="center-hrz">
                <div style={{backgroundImage: `url(${userDoc.photoURL})`}} className="profile_pic">
                </div>
            </div>

            <br />
            {/* <button className="button button2">Edit Details</button> */}
            
        </div>
    )
}

export default AccountDetails
