import { Outlet } from "react-router-dom";
import Header from "../common/Header";

const Layouts = () => {
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}

export default Layouts;