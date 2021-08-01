import React from 'react';
import {Link} from "react-router-dom";


//
const Suggestion = (props) => {
    return (
        <Link to={`/subject/${props.subject}`}>
            <div className="selected-subjects text-size">
                <p className="tutee-subject-card-names">{props.subject}</p>
            </div>
        </Link>

    )
}

export default Suggestion
