import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
// import RestaurantList from "./components/RestaurantList";
import RestaurantDetail from "./components/RestaurantDetail";
import RestaurantForm from "./components/RestaurantForm";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* <Route path="/" element={<RestaurantList />} /> */}
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/add" element={<RestaurantForm />} />
        <Route
          path="/edit/:id"
          element={<RestaurantForm isEditMode={true} />}
        />
      </Route>
    </Routes>
  );
};

export default App;
