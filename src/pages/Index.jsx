import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-center bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Welcome to FoodieTeam</h1>
        <p className="text-xl text-gray-600 mb-8">Streamline your team's food orders with ease and efficiency!</p>
        <Button
          onClick={handleLogin}
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;
