import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const [userRole, setUserRole] = useState('admin'); // For demo purposes, toggle between 'admin' and 'team'
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderStarted, setOrderStarted] = useState(false);

  const menuItems = [
    { id: 1, name: 'Burger', price: 10 },
    { id: 2, name: 'Pizza', price: 12 },
    { id: 3, name: 'Salad', price: 8 },
    { id: 4, name: 'Pasta', price: 11 },
  ];

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const startOrder = () => {
    setOrderStarted(true);
    // Here you would implement the logic to spawn a WhatsApp agent
    console.log("WhatsApp agent spawned to make the order");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Order Dashboard</h1>
      <Button onClick={() => setUserRole(userRole === 'admin' ? 'team' : 'admin')} className="mb-4">
        Toggle Role (Current: {userRole})
      </Button>
      
      {userRole === 'admin' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => alert("Request for order sent to team members")}>
              Send Request for Order
            </Button>
            <Button onClick={startOrder} className="ml-4" disabled={orderStarted}>
              {orderStarted ? "Order Started" : "Start Order"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {menuItems.map(item => (
            <div key={item.id} className="flex items-center justify-between mb-2">
              <span>{item.name} - ${item.price}</span>
              <Select onValueChange={(value) => handleItemSelect(item.id)} value={selectedItems.includes(item.id) ? 'selected' : ''}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not selected</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;