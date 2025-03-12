import { Routes, Route } from "react-router-dom";
import RestaurantList from "./components/RestaurantList";
import RestaurantDetail from "./components/RestaurantDetail";
import RestaurantEditForm from "./components/RestaurantEditForm";
import RoomList from "./components/RoomList";
import Layout from "./components/Layout";
import RestaurantForm from "./components/RestaurantForm";
import Home from "./components/Home";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/list" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/restaurant/add" element={<RestaurantForm />} />
        <Route path="/restaurant/edit/:id" element={<RestaurantEditForm />} />
        <Route path="/rooms" element={<RoomList />} />
      </Route>
    </Routes>
  );
};

export default App;
