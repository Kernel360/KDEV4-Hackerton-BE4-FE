import React from "react";
import { Routes, Route } from "react-router-dom";
import RestaurantList from "./components/RestaurantList";
import RestaurantDetail from "./components/RestaurantDetail";
import RestaurantEditForm from "./components/RestaurantEditForm";
import RoomList from "./components/RoomList";
import Layout from "./components/Layout";
import RestaurantForm from "./components/RestaurantForm";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/add" element={<RestaurantForm />} />
        <Route path="/edit/:id" element={<RestaurantEditForm />} />
        <Route path="/rooms" element={<RoomList />} />
        {/* ✅ 회의실 예약 페이지 */}
      </Route>
    </Routes>
  );
};

export default App;
