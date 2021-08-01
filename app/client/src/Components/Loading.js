import React, {useEffect, useRef} from 'react';
import lottie from "lottie-web";
import LoadingAnim from "../animations/loading.json";

const Loading = ({size = "normal"}) => {
    const loadingAnimContainerRef = useRef(),
          animRef = useRef(null);

          useEffect(()=>{
            animRef.current = lottie.loadAnimation({
                container: loadingAnimContainerRef.current,
                animationData: LoadingAnim,
                loop: true
            });
            animRef.current.play();
        },[])

        let loadingWidth 
        switch (size) {
            case "normal":
                loadingWidth = "50rem"
                break;
                case "medium":
                    loadingWidth = "10rem"
                    break;
            case "small":
            loadingWidth = "2.5rem";
            break;
            default:
                break;
        }

    return (
        <div className="loading__container center-hrz" style={{width: loadingWidth}}>
            <div ref={loadingAnimContainerRef} className="loading">
            </div>
        </div>
    )
}

export default Loading
