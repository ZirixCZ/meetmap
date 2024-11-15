import Admin from "../components/Admin/Admin";
import Filters from "../components/Filters/Filters";
import RightFloaters from "../components/RightFloaters/RightFloaters";

import styles from "./map.module.css";

const AdminRoute = () => {
  return (
    <div className={styles.container}>
      <Admin />
    </div>
  );
};

export default AdminRoute;
